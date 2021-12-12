import { FastifyPluginAsync } from 'fastify';
import { broadcastServicePlugin } from './service';
import { broadcastPreHandlerPlugin } from './preHandler';
import {
  broadcastParamsSchema,
  broadcastPostBodySchema,
  broadcastPutBodySchema,
  BroadcastPostBody,
  BroadcastPutBody,
  broadcastListGetResponseSchema,
  broadcastGetResponseSchema,
  broadcastPostPutDeleteResponseSchema,
} from './schema';

const broadcast: FastifyPluginAsync = async (fastify): Promise<void> => {
  // BroadcastのCRUD機能＋放送リスト取得機能プラグインを読み込む！
  await fastify.register(broadcastServicePlugin);
  // 管理者ではないユーザーが放送を作成・更新・削除しようとしたとき、403を返す。
  // 指定した放送が存在しないとき、400を返す。
  await fastify.register(broadcastPreHandlerPlugin);

  // 放送リスト取得機能
  fastify.get(
    '/',
    {
      schema: {
        response: {
          '200': broadcastListGetResponseSchema,
        },
      },
    },
    async (req, res) => {
      const resultBroadcastList = await fastify.getBroadcastList();
      res.send(resultBroadcastList);
    },
  );

  // 放送情報取得
  fastify.get<{
    Params: { id: number };
  }>(
    `/:id`,
    {
      schema: {
        params: broadcastParamsSchema,
        response: {
          '200': broadcastGetResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const resultBroadcastInfo = await fastify.getBroadcast({
        id,
        isAdmin: req.userInfo.isAdmin,
        userId: req.userInfo.id,
      });
      res.send(resultBroadcastInfo);
    },
  );

  // 放送作成機能
  fastify.post<{ Body: BroadcastPostBody }>(
    `/`,
    {
      schema: {
        body: broadcastPostBodySchema,
        response: {
          '201': broadcastPostPutDeleteResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { title, scheduledStartTime } = req.body;
      const resultCreateBroadcastInfo = await fastify.createBroadcast({
        title,
        scheduledStartTime,
      });
      res.status(201).send(resultCreateBroadcastInfo);
    },
  );

  // 放送情報更新機能
  fastify.put<{ Params: { id: number }; Body: BroadcastPutBody }>(
    `/:id`,
    {
      schema: {
        params: broadcastParamsSchema,
        body: broadcastPutBodySchema,
        response: {
          '200': broadcastPostPutDeleteResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { title, scheduledStartTime, status, archiveUrl } = req.body;
      const resultUpdateBroadcastInfo = await fastify.updateBroadcast({
        id: Number(id),
        title,
        scheduledStartTime,
        status,
        archiveUrl,
      });
      res.send(resultUpdateBroadcastInfo);
    },
  );

  // 放送削除機能
  fastify.delete<{
    Params: { id: number };
  }>(
    `/:id`,
    {
      schema: {
        params: broadcastParamsSchema,
        response: {
          '200': broadcastPostPutDeleteResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const resultDeleteBroadcastInfo = await fastify.deleteBroadcast({
        id: Number(id),
      });
      res.send(resultDeleteBroadcastInfo);
    },
  );
};

export default broadcast;
