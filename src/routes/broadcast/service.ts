import { Broadcast, Trivia, User } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

interface GetParams {
  id: number;
  token?: string;
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
  archiveUrl?: string
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
      (params: GetParams): Promise<Broadcast & {
        Trivia: (Trivia & {
          User: User;
        })[] | undefined;
      }>
    }
    createBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: CreateParams): Promise<Broadcast>
    }
    updateBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateParams): Promise<Broadcast>
    }
    deleteBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteParams): Promise<Broadcast>
    }
  }
}

const broadcastPlugin: FastifyPluginAsync = async (fastify) => {
  // --------------------- 放送情報取得 --------------------- //
  fastify.decorate('getBroadcast', async (params: GetParams) => {
    if (!params.id) {
      throw new Error('Specify id or token');
    }
    // 放送情報取得
    const resultBroadcast = await fastify.prisma.broadcast.findUnique({
      where: { id: params.id },
      include: {
        Trivia: {
          include: {
            User: true,
          },
        },
      },
    });
    if (!resultBroadcast) {
      throw new Error('not found Broadcast');
    }

    if (!params.token) {
      return resultBroadcast.status === 'ended'
        ? resultBroadcast
        : { ...resultBroadcast, Trivia: undefined };
    }

    // ユーザー情報を取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
    });
    if (!resultUserInfo) {
      throw new Error('not found userInfo');
    }

    // ユーザーが管理者の場合
    if (resultUserInfo.isAdmin === true) {
      // 放送情報を取得
      return resultBroadcast;
    }

    // 管理者でない場合
    if (resultUserInfo.isAdmin === false) {
      return resultBroadcast.status === 'ended'
        ? resultBroadcast
        : { ...resultBroadcast, Trivia: undefined };
    }
  });

  // ---------------------- 放送作成 --------------------- //
  fastify.decorate('createBroadcast', async (params: CreateParams) => {
    // ユーザー情報取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token }
    });

    // 管理者の場合
    if (resultUserInfo?.isAdmin === true) {
      const resultCreateBroadcast = await fastify.prisma.broadcast.create({
        data: {
          title: params.title,
          scheduledStartTime: params.scheduledStartTime
        }
      });
      return resultCreateBroadcast;
    }

    // 管理者ではない場合
    throw new Error('not admin');
  });

  // ---------------------- 放送情報更新 --------------------- //
  fastify.decorate('updateBroadcast', async (params: UpdateParams) => {
    // ユーザー情報取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token }
    });

    // 管理者の場合
    if (resultUserInfo?.isAdmin === true) {
      const resultUpdateBroadcast = await fastify.prisma.broadcast.update({
        where: { id: params.id },
        data: {
          title: params.title,
          scheduledStartTime: params.scheduledStartTime,
          status: params.status,
          archiveUrl: params.archiveUrl
        }
      });
      return resultUpdateBroadcast;
    }

    // 管理者ではない場合
    throw new Error('not admin');
  })

  // ---------------------- 放送削除 --------------------- //
  fastify.decorate('deleteBroadcast', async (params: DeleteParams) => {
    // ユーザー情報取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token }
    });

    // 管理者の場合
    if (resultUserInfo?.isAdmin === true) {
      const resultDeleteBroadcast = await fastify.prisma.broadcast.delete({
        where: { id: params.id },
        include: {
          Trivia: { where: { broadcastId: params.id } },
        }
      });
      return resultDeleteBroadcast;
    }

    // 管理者ではない場合
    throw new Error('not admin');
  })
}

export default fp(broadcastPlugin);
