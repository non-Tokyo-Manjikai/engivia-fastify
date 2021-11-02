import { Trivia } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

interface UpdateParams {
  id: number;
  content: string;
  token: string;
}

interface CreateParams {
  token: string;
  content: string;
  broadcastId: number;
}

interface DeleteParams {
  id: number;
  token: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    createTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: CreateParams): Promise<Trivia>;
    };
    updateTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateParams): Promise<Trivia>;
    };
    deleteTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteParams): Promise<Trivia>;
    };
  }
}

const triviaPlugin: FastifyPluginAsync = async (fastify) => {
  // ---------------------- 放送情報更新 --------------------- //

  fastify.decorate('createTrivia', async (params: CreateParams) => {
    // ユーザー情報を取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
      include: {
        Trivia: {
          where: { broadcastId: params.broadcastId },
        },
      },
    });

    // ユーザーが存在しない場合エラー
    if (!resultUserInfo) {
      throw Error('not found user');
    }
    // ユーザーは複数のトリビアを投稿できない
    if (resultUserInfo.Trivia.length !== 0) {
      throw Error('create only trivia');
    }
    // ユーザーが管理者の場合、トリビアを投稿できない
    if (resultUserInfo.isAdmin === true) {
      throw Error('Cannot create trivia');
    }

    // トリビア投稿
    const resultCreated = await fastify.prisma.trivia.create({
      data: {
        content: params.content,
        userId: resultUserInfo.id,
        broadcastId: params.broadcastId,
      },
    });
    return resultCreated;
  });

  fastify.decorate('updateTrivia', async (params: UpdateParams) => {
    // ユーザー情報とユーザーが投稿したトリビアを取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
      include: {
        Trivia: {
          where: { id: params.id },
        },
      },
    });

    if (!resultUserInfo) {
      throw new Error('not found user');
    }

    // ユーザーが管理者の場合、他のユーザーが投稿したトリビアを変更できる
    if (resultUserInfo.isAdmin === true) {
      const resultUpdated = await fastify.prisma.trivia.update({
        where: { id: params.id },
        data: {
          content: params.content,
        },
      });
      return resultUpdated;
    }

    // 指定したトリビアIDが、ユーザーが投稿したトリビアでない場合
    if (resultUserInfo.Trivia.length === 0) {
      throw new Error('Cannot update trivia for other users');
    }

    const resultUpdated = await fastify.prisma.trivia.update({
      where: { id: params.id },
      data: {
        content: params.content,
      },
    });
    return resultUpdated;
  });

  fastify.decorate('deleteTrivia', async (params: DeleteParams) => {
    // ユーザー情報とユーザーが投稿したトリビアを取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
      include: {
        Trivia: {
          where: { id: params.id },
        },
      },
    });

    // ユーザーが存在しない場合エラー
    if (!resultUserInfo) {
      throw new Error('not found user trivia');
    }
    // トリビアが存在しない場合エラー
    if (resultUserInfo.Trivia.length === 0) {
      throw new Error('not found trivia');
    }

    // ユーザーが管理者の場合、他のユーザーが投稿したトリビアを削除できる
    if (resultUserInfo.isAdmin === true) {
      const resultDeleted = await fastify.prisma.trivia.delete({
        where: { id: params.id },
      });
      return resultDeleted;
    }

    // ユーザーがトリビアを投稿していたら、そのユーザーがトリビアを削除できる
    const resultDeleted = await fastify.prisma.trivia.delete({
      where: { id: params.id },
    });

    return resultDeleted;
  });
};

export default fp(triviaPlugin);
