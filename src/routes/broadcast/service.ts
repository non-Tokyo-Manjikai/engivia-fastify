import { Broadcast, Prisma, Trivia, User } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

interface GetParams {
  id: number;
  token: string;
}

interface CreateParams {
  title: string;
  scheduledStartTime: string;
  token: string;
}

interface UpdateParams {
  id: number;
  title?: string;
  scheduledStartTime?: string;
  status?: string;
  archiveUrl?: string;
  token: string;
}

interface DeleteParams {
  id: number;
  token: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    getBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: GetParams): Promise<
        Broadcast & {
          Trivia:
            | (Trivia & {
                User: User;
              })[]
            | undefined;
        }
      >;
    };
    getBroadcastList: {
      // eslint-disable-next-line no-unused-vars
      (): Promise<Broadcast>;
    };
    createBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: CreateParams): Promise<Broadcast>;
    };
    updateBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateParams): Promise<Broadcast>;
    };
    deleteBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteParams): Promise<Broadcast>;
    };
  }
}

const broadcastPlugin: FastifyPluginAsync = async (fastify) => {
  // ---------------------- 放送リスト取得 --------------------- //
  fastify.decorate('getBroadcastList', async () => {
    const resultBroadcastList = await fastify.prisma.broadcast.findMany({
      select: {
        id: true,
        title: true,
        scheduledStartTime: true,
        status: true,
        _count: { select: { Trivia: true } },
      },
    });
    return resultBroadcastList;
  });

  // --------------------- 放送情報取得 --------------------- //
  fastify.decorate('getBroadcast', async (params: GetParams) => {
    if (!params.id || !params.token) {
      throw new Error('Specify id and token');
    }
    // ユーザー情報を取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
    });
    if (!resultUserInfo) {
      throw new Error('not found userInfo');
    }

    // ユーザーが管理者でない場合、ユーザーの投稿したトリビアのみ取得するwhere文が作成される
    const whereTrivia: Prisma.TriviaWhereInput | undefined =
      resultUserInfo.isAdmin === false
        ? {
            OR: [
              { Broadcast: { status: 'ended' } },
              { userId: resultUserInfo.id },
            ],
          }
        : undefined;

    // 放送情報を取得
    const resultBroadcast = await fastify.prisma.broadcast.findUnique({
      where: { id: params.id },
      include: {
        Trivia: {
          where: whereTrivia,
          include: {
            User: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return resultBroadcast;
  });

  // ---------------------- 放送作成 --------------------- //
  fastify.decorate('createBroadcast', async (params: CreateParams) => {
    if (!params.token) {
      throw new Error('Specify token');
    }
    // ユーザー情報取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
    });

    if (!resultUserInfo) {
      throw new Error('Invalid token');
    }

    // 管理者の場合
    if (resultUserInfo?.isAdmin === true) {
      const resultCreateBroadcast = await fastify.prisma.broadcast.create({
        data: {
          title: params.title,
          scheduledStartTime: params.scheduledStartTime,
        },
      });
      return resultCreateBroadcast;
    }

    // 管理者ではない場合
    throw new Error('not admin');
  });

  // ---------------------- 放送情報更新 --------------------- //
  fastify.decorate('updateBroadcast', async (params: UpdateParams) => {
    if (!params.token) {
      throw new Error('Specify token');
    }
    // ユーザー情報取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
    });

    // 管理者の場合
    if (resultUserInfo?.isAdmin === true) {
      const resultUpdateBroadcast = await fastify.prisma.broadcast.update({
        where: { id: params.id },
        data: {
          title: params.title,
          scheduledStartTime: params.scheduledStartTime,
          status: params.status,
          archiveUrl: params.archiveUrl,
        },
      });
      return resultUpdateBroadcast;
    }

    // 管理者ではない場合
    throw new Error('not admin');
  });

  // ---------------------- 放送削除 --------------------- //
  fastify.decorate('deleteBroadcast', async (params: DeleteParams) => {
    if (!params.token) {
      throw new Error('Specify token');
    }
    // ユーザー情報取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
    });

    // 管理者の場合
    if (resultUserInfo?.isAdmin === true) {
      const deleteBroadcast = fastify.prisma.broadcast.delete({
        where: { id: params.id },
      });
      const deleteTrivia = fastify.prisma.trivia.deleteMany({
        where: { broadcastId: params.id }
      });
      const result = await fastify.prisma.$transaction([deleteTrivia, deleteBroadcast]);
      return result;
    }

    // 管理者ではない場合
    throw new Error('not admin');
  });
};

export default fp(broadcastPlugin);
