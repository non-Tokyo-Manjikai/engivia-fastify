import { User } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Storage } from '@google-cloud/storage';

const storage =
  process.env.NODE_ENV === 'production'
    ? new Storage()
    : new Storage({
        projectId: 'ntm-engivia',
        keyFilename: 'gcs-token.json',
      });

type UpdateParams = {
  id: string;
  name?: string;
  image?: string;
};

type DeleteParams = {
  id: string;
};

type UploadParams = {
  id: string;
  base64: string;
};

type UpdatedUser = {
  id: string;
  name: string;
  image: string;
};

declare module 'fastify' {
  interface FastifyInstance {
    updateUser: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateParams): Promise<UpdatedUser>;
    };
    deleteUser: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteParams): Promise<User>;
    };
    uploadIcon: {
      // eslint-disable-next-line no-unused-vars
      (params: UploadParams): Promise<string>;
    };
  }
}

const userPlugin: FastifyPluginAsync = async (fastify) => {
  // ---------------------- ユーザー情報更新 --------------------- //
  fastify.decorate('updateUser', async (params: UpdateParams): Promise<UpdatedUser> => {
    const resultUpdateUser = await fastify.prisma.user.update({
      where: { id: params.id },
      data: {
        name: params.name,
        image: params.image,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
    return resultUpdateUser;
  });

  // ---------------------- ユーザー情報削除 --------------------- //
  fastify.decorate('deleteUser', async (params: DeleteParams): Promise<User> => {
    if (!params.id) {
      throw new Error(`Specify id`);
    }

    // 保存されている画像を削除
    const file = storage.bucket('users_icon').file(`${params.id}.png`);
    await file.delete({ ignoreNotFound: true });

    // ユーザー情報とユーザーが投稿したトリビアを全て削除
    const deleteTrivia = fastify.prisma.trivia.deleteMany({
      where: { userId: params.id },
    });
    const deleteUser = fastify.prisma.user.delete({
      where: { id: params.id },
    });
    const deletedResult = await fastify.prisma.$transaction([deleteTrivia, deleteUser]);
    return deletedResult[1];
  });

  // ---------------------- ユーザーアイコンアップロード --------------------- //
  fastify.decorate('uploadIcon', async (params: UploadParams): Promise<string> => {
    if (!params.id || !params.base64) {
      throw new Error('Specify userId and base64');
    }

    const imageBuffer = Buffer.from(params.base64, 'base64');
    // ファイルサイズが5MB以上の場合
    if (imageBuffer.length > 5000000) {
      throw new Error('Image files larger than 5MB cannot be uploaded.');
    }
    fastify.log.info('Byte length: ' + imageBuffer.length);

    // Cloud Storage に画像をアップロード
    const file = storage.bucket('users_icon').file(`${params.id}.png`);
    await file.save(imageBuffer).catch((e) => {
      fastify.log.error(e);
      throw new Error('upload failure');
    });
    return `https://storage.googleapis.com/users_icon/${params.id}.png`;
  });
};

export default fp(userPlugin);
