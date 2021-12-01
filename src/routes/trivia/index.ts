import { FastifyPluginAsync } from 'fastify';
import { triviaPlugin } from './service';
import { triviaPreHandlerPlugin } from './preHandler';
import {
  triviaPostBodySchema,
  triviaPutBpdySchema,
  triviaDeleteParamsSchema,
  triviaPostPutDeleteResponseSchema,
  TriviaPostBody,
  TriviaPutBody,
} from './schema';

const trivia: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Triviaプラグインを読み込む！
  await fastify.register(triviaPlugin);
  // 事前チェック
  await fastify.register(triviaPreHandlerPlugin);

  fastify.post<{ Body: TriviaPostBody }>(
    `/`,
    {
      schema: {
        body: triviaPostBodySchema,
        response: { '201': triviaPostPutDeleteResponseSchema },
      },
    },
    async (req, res) => {
      const { content, broadcastId } = req.body;
      const resultUpdateBroadcastInfo = await fastify.createTrivia({
        content,
        broadcastId,
        userId: req.userInfo.id,
      });
      res.status(201).send(resultUpdateBroadcastInfo);
    },
  );

  fastify.put<{ Params: { id: number }; Body: TriviaPutBody }>(
    `/:id`,
    {
      schema: {
        body: triviaPutBpdySchema,
        response: { '200': triviaPostPutDeleteResponseSchema },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { content, hee, featured } = req.body;
      const resultUpdateBroadcastInfo = await fastify.updateTrivia({
        id: Number(id),
        hee,
        content,
        featured,
        userId: req.userInfo.id,
        isAdmin: req.userInfo.isAdmin,
      });
      res.send(resultUpdateBroadcastInfo);
    },
  );

  fastify.delete<{ Params: { id: number } }>(
    `/:id`,
    {
      schema: {
        params: triviaDeleteParamsSchema,
        response: { '200': triviaPostPutDeleteResponseSchema },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const resultDeleteTriviaInfo = await fastify.deleteTrivia({
        id: Number(id),
      });
      res.send(resultDeleteTriviaInfo);
    },
  );
};

export default trivia;
