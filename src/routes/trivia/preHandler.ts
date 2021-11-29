import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

type triviaPostPutBpdy = {
  content: string,
  broadcastId: number,
  hee: number,
  featured: boolean,
}

export const triviaPreHandlerPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook<{ Params: { id: number }, Body: triviaPostPutBpdy }>(
    'preHandler',
    async (req, res) => {
      // トリビアを作成するとき、既にトリビアが保存されているかチェックする
      if (req.method === 'POST') {
        // 管理者はエンジビアを投稿できない
        if (req.userInfo.isAdmin) {
          res.code(400);
          throw new Error('Admin are not allowed to post engivia.');
        }
        const resultTrivia = await fastify.prisma.trivia.findFirst({
          where: {
            AND: [
              { userId: req.userInfo.id },
              { broadcastId: req.body.broadcastId }
            ]
          }
        });
        // 既に投稿している場合
        if (resultTrivia) {
          res.code(400);
          throw new Error('The engivia has already been posted.');
        }
        // 投稿されていない場合
        return;
      }

      // 投稿したエンジビアがあるかチェック
      if (/PUT|DELETE/.test(req.method)) {
        const resultTrivia = await fastify.prisma.trivia.findUnique({
          where: { id: Number(req.params.id) },
        });

        // 指定したIDが存在する場合
        if (resultTrivia) {
          // 管理者ではないユーザーはへぇカウント、フィーチャーを更新できない
          if (!req.userInfo.isAdmin && (req.body.featured !== undefined || req.body.hee !== undefined)) {
            res.code(403);
            throw new Error(`The user cannot update the featured and hee.`);
          }
          // 管理者・投稿したユーザー本人の場合
          if (req.userInfo.isAdmin || resultTrivia.userId === req.userInfo.id) return;
          // 他のユーザーが投稿したエンジビアを更新・削除しようとしたとき
          res.code(403);
          throw new Error(`It is not possible to update or delete another user's endivia.`);
        }

        // IDが存在しない場合
        res.code(400);
        throw new Error('Engivia not found.');
      }
    },
  )
});
