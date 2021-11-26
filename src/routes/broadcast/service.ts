import { Broadcast, Prisma } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  CreateBroadcastParams,
  DeleteBroadcastParams,
  GetBroadcastListResponse,
  GetBroadcastParams,
  GetBroadcastResponse,
  UpdateBroadcastParams,
} from './type';

declare module 'fastify' {
  interface FastifyInstance {
    getBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: GetBroadcastParams): Promise<GetBroadcastResponse>;
    };
    getBroadcastList: {
      // eslint-disable-next-line no-unused-vars
      (): Promise<GetBroadcastListResponse>;
    };
    createBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: CreateBroadcastParams): Promise<Broadcast>;
    };
    updateBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateBroadcastParams): Promise<Broadcast>;
    };
    deleteBroadcast: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteBroadcastParams): Promise<Broadcast>;
    };
  }
}

export const broadcastServicePlugin: FastifyPluginAsync = fp(async (fastify) => {
  // ---------------------- 放送リスト取得 --------------------- //
  fastify.decorate(
    'getBroadcastList',
    async (): Promise<GetBroadcastListResponse> => {
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
    },
  );

  // --------------------- 放送情報取得 --------------------- //
  fastify.decorate(
    'getBroadcast',
    async (params: GetBroadcastParams): Promise<GetBroadcastResponse> => {
      // ユーザーが管理者でない場合、ユーザーの投稿したトリビアのみ取得するwhere文が作成される
      const whereTrivia: Prisma.TriviaWhereInput | undefined =
        params.isAdmin === false
          ? {
              OR: [
                { Broadcast: { status: 'ended' } },
                { userId: params.userId },
              ],
            }
          : undefined;

      // 放送情報を取得
      const resultBroadcast = await fastify.prisma.broadcast.findUnique({
        where: { id: params.id },
        include: {
          Trivia: {
            where: whereTrivia,
            select: {
              id: true,
              content: true,
              hee: true,
              featured: true,
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
    },
  );

  // ---------------------- 放送作成 --------------------- //
  fastify.decorate(
    'createBroadcast',
    async (params: CreateBroadcastParams): Promise<Broadcast> => {
      const resultCreateBroadcast = await fastify.prisma.broadcast.create({
        data: {
          title: params.title,
          scheduledStartTime: params.scheduledStartTime,
        },
      });
      return resultCreateBroadcast;
    },
  );

  // ---------------------- 放送情報更新 --------------------- //
  fastify.decorate(
    'updateBroadcast',
    async (params: UpdateBroadcastParams): Promise<Broadcast> => {
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
    },
  );

  // ---------------------- 放送削除 --------------------- //
  fastify.decorate(
    'deleteBroadcast',
    async (params: DeleteBroadcastParams): Promise<Broadcast> => {
      // 管理者の場合
      const deleteBroadcast = fastify.prisma.broadcast.delete({
        where: { id: params.id },
      });
      const deleteTrivia = fastify.prisma.trivia.deleteMany({
        where: { broadcastId: params.id },
      });
      const result = await fastify.prisma.$transaction([
        deleteTrivia,
        deleteBroadcast,
      ]);
      return result[1];
    },
  );
});
