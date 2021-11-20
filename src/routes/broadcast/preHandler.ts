import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export const broadcastPreHandlerPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook<{ Params: { id: number } }>(
    'preHandler',
    async (req, res) => {
      // 放送一覧を取得するとき、以下(11行目から)の処理は行わない
      if (req.url === '/broadcast' && req.method === 'GET') return;

      // 管理者のみ放送を作成・更新・削除できるようにする
      const broadcastmeshodRegexp = /POST|PUT|DELETE/;
      if (!req.userInfo?.isAdmin && broadcastmeshodRegexp.test(req.method)) {
        res.code(403);
        throw new Error('Only admin can access');
      }

      // 放送が存在するか事前チェックする
      const resultBroadcast = await fastify.getBroadcast({
        id: Number(req.params.id),
      });
      if (!resultBroadcast) {
        res.code(400);
        throw new Error('not found broadcast');
      }
    },
  )
});
