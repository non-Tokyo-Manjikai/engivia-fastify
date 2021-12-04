import { Prisma, Trivia } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  CreateTriviaParams,
  UpdateTriviaParams,
  DeleteTriviaParams,
} from './type';

declare module 'fastify' {
  interface FastifyInstance {
    createTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: CreateTriviaParams): Promise<Trivia>;
    };
    updateTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateTriviaParams): Promise<Trivia>;
    };
    deleteTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: DeleteTriviaParams): Promise<Trivia>;
    };
  }
}

export const triviaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorate('createTrivia', async (params: CreateTriviaParams) => {
    // トリビア投稿
    const resultCreated = await fastify.prisma.trivia.create({
      data: {
        content: params.content,
        userId: params.userId,
        broadcastId: params.broadcastId,
      },
    });
    return resultCreated;
  });

  fastify.decorate('updateTrivia', async (params: UpdateTriviaParams) => {
    // ユーザーが管理者の場合、他のユーザーが投稿したトリビアの内容とへぇカウント、フィーチャーを変更できる
    // ユーザーの場合、トリビアの内容のみ変更できる
    const updateData: Prisma.TriviaUpdateInput =
      params.isAdmin === true
        ? {
            content: params.content,
            hee: params.hee,
            featured: params.featured,
          }
        : {
            content: params.content,
          };

    const resultUpdated = await fastify.prisma.trivia.update({
      where: { id: params.id },
      data: updateData,
    });
    return resultUpdated;
  });

  fastify.decorate('deleteTrivia', async (params: DeleteTriviaParams) => {
    // ユーザーがトリビアを投稿していたら、そのユーザーがトリビアを削除できる
    const resultDeleted = await fastify.prisma.trivia.delete({
      where: { id: params.id },
    });
    return resultDeleted;
  });
});
