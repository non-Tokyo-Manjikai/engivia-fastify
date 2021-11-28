import { FastifyPluginAsync } from 'fastify';
import triviaPlugin from './service';
import { triviaPreHandlerPlugin } from './preHandler';
import {
  bodyPostTriviaSchema,
  bodyPutTriviaSchema,
  paramsDeleteTrivia,
} from './schema';

type PostBody = {
  content: string;
  broadcastId: number;
};

type PutBody = {
  content?: string;
  hee?: number;
  featured?: boolean;
  token: string;
};

const trivia: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Triviaプラグインを読み込む！
  await fastify.register(triviaPlugin);
  // 事前チェック
  await fastify.register(triviaPreHandlerPlugin);

  fastify.post<{ Body: PostBody }>(
    `/`,
    {
      schema: {
        body: bodyPostTriviaSchema,
      },
    },
    async (req, res) => {
      const { content, broadcastId } = req.body;
      const resultUpdateBroadcastInfo = await fastify.createTrivia({
        content,
        broadcastId,
        userId: req.userInfo.id,
      });
      res.send(resultUpdateBroadcastInfo);
    },
  );

  fastify.put<{ Params: { id: number }; Body: PutBody }>(
    `/:id`,
    {
      schema: {
        body: bodyPutTriviaSchema,
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
    { schema: { params: paramsDeleteTrivia } },
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
