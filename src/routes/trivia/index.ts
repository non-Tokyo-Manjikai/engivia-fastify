import { FastifyPluginAsync } from 'fastify';
import triviaPlugin from './service';
import {
  bodyPostTriviaSchema,
  bodyPutTriviaSchema,
  paramsDeleteTrivia,
} from './schema';

type PostBody = {
  content: string;
  broadcastId: number;
  token: string;
};

type PutBody = {
  id: number;
  content?: string;
  hee?: number;
  featured?: boolean;
  token: string;
};

const trivia: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Triviaプラグインを読み込む！
  await fastify.register(triviaPlugin);

  fastify.post<{ Body: PostBody }>(
    `/`,
    {
      schema: {
        body: bodyPostTriviaSchema,
      },
    },
    async (req, res) => {
      const { content, broadcastId, token } = req.body;
      const resultUpdateBroadcastInfo = await fastify.createTrivia({
        content,
        broadcastId,
        token,
      });
      res.send(resultUpdateBroadcastInfo);
    },
  );

  fastify.put<{ Body: PutBody }>(
    `/`,
    {
      schema: {
        body: bodyPutTriviaSchema,
      },
    },
    async (req, res) => {
      const { id, content, hee, featured, token } = req.body;
      const resultUpdateBroadcastInfo = await fastify.updateTrivia({
        id,
        hee,
        content,
        featured,
        token,
      });
      res.send(resultUpdateBroadcastInfo);
    },
  );

  fastify.delete<{ Params: { id: number } }>(
    `/:id`,
    { schema: { params: paramsDeleteTrivia } },
    async (req, res) => {
      const { id } = req.params;
      const token = req?.headers?.authorization?.split(' ')[1] as string;
      const resultDeleteTriviaInfo = await fastify.deleteTrivia({
        id: Number(id),
        token,
      });
      res.send(resultDeleteTriviaInfo);
    },
  );
};

export default trivia;
