import { Broadcast, User } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: 'ntm-engivia',
  keyFilename: 'gcs-token.json'
});

interface GetParams {
  id?: string;
  token?: string;
}

interface UpdateParams {
  name?: string;
  image?: string;
  token: string;
}

interface DeleteParams {
  token: string;
}

interface UploadParams {
  token: string;
  base64: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    getUser: {
      // eslint-disable-next-line no-unused-vars
      (params: GetParams): Promise<User>
    }
    updateUser: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateParams): Promise<Broadcast>
    }
    deleteUser: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteParams): Promise<Broadcast>
    }
    uploadIcon: {
      // eslint-disable-next-line no-unused-vars
      (params: UploadParams): Promise<string>
    }
  }
}

const userPlugin: FastifyPluginAsync = async (fastify) => {
  // --------------------- ユーザー情報取得 --------------------- //
  fastify.decorate('getUser', async (params: GetParams) => {
    if (!params.id && !params.token) {
      throw new Error('Specify id or token');
    }
    if (params.id) {
      const resultUserInfo = await fastify.prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          image: true,
          isAdmin: true
        },
      });
      return resultUserInfo;
    }

    // token がある場合は、token で user を検索
    const resultUserInfo = await fastify.prisma.user.findFirst({
      where: { token: params.token },
      select: {
        id: true,
        name: true,
        image: true,
        isAdmin: true
      }
    });
    return resultUserInfo;
  });

  // ---------------------- ユーザー情報更新 --------------------- //
  fastify.decorate('updateUser', async (params: UpdateParams) => {
    const resultUpdateBroadcast = await fastify.prisma.user.update({
      where: { token: params.token },
      data: {
        name: params.name,
        image: params.image,
      }
    });
    return resultUpdateBroadcast;
  });

  // ---------------------- ユーザー情報削除 --------------------- //
  fastify.decorate('deleteUser', async (params: DeleteParams) => {
    const resultGetUser = await fastify.prisma.user.findFirst({
      where: { token: params.token }
    });

    if (!resultGetUser) {
      throw new Error(`not found user`);
    }

    // ユーザー情報とユーザーが投稿したトリビアを全て削除
    const deleteUser = await fastify.prisma.user.delete({
      where: { id: resultGetUser.id },
      include: {
        Trivia: {
          where: { userId: resultGetUser.id }
        }
      }
    });
    return deleteUser
  })

  // ---------------------- ユーザーアイコンアップロード --------------------- //
  fastify.decorate('uploadIcon', async (params: UploadParams) => {
    if (!params.token) {
      throw new Error('Specify id token');
    }

    // ユーザー情報を取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token }
    });
    if (!resultUserInfo) {
      throw new Error('not found user');
    }

    const imageBuffer = Buffer.from(params.base64, "base64");
    // ファイルサイズが5MB以上の場合
    if (imageBuffer.length > 5000000) {
      throw new Error('Image files larger than 5MB cannot be uploaded.');
    }
    console.log("Byte length: " + imageBuffer.length);

    // Cloud Storage に画像をアップロード
    const file = storage.bucket('users_icon').file(`${resultUserInfo.id}.png`);
    await file.save(imageBuffer).catch((e) => {
      console.error(e);
      throw new Error('upload failure');
    });
    return `https://storage.googleapis.com/users_icon/${resultUserInfo.id}.png`;
  })
}

export default fp(userPlugin);
