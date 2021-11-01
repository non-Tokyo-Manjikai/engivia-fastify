import { Trivia } from '.prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

interface UpdateParams {
  id: number;
  content: string;
  token: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    updateTrivia: {
      // eslint-disable-next-line no-unused-vars
      (params: UpdateParams): Promise<Trivia>
    }
  }
}

const triviaPlugin: FastifyPluginAsync = async (fastify) => {
  // ---------------------- 放送情報更新 --------------------- //
  fastify.decorate('updateTrivia', async (params: UpdateParams) => {
    // ユーザー情報とユーザーが投稿したトリビアを取得
    const resultUserInfo = await fastify.prisma.user.findUnique({
      where: { token: params.token },
      include: {
        Trivia: {
          where: { id: params.id }
        }
      }
    });

    if (!resultUserInfo) {
      throw new Error('not found user');
    }

    // ユーザーが管理者の場合、他のユーザーが投稿したトリビアを変更できる
    if (resultUserInfo.isAdmin === true) {
      const resultUpdated = await fastify.prisma.trivia.update({
        where: { id: params.id },
        data: {
          content: params.content
        }
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
}

export default fp(triviaPlugin);
