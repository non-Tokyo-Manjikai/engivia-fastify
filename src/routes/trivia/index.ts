import { FastifyPluginAsync } from "fastify";
import triviaPlugin from "./service";

type PutBody = {
  id: number;
  content: string;
  token: string;
}

const trivia: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Triviaプラグインを読み込む！
  await fastify.register(triviaPlugin);

  fastify.put<{ Body: PutBody }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultUpdateBroadcastInfo = await fastify.updateTrivia({
      ...req.body,
      token,
    });
    res.send(resultUpdateBroadcastInfo);
  });
}

export default trivia;
