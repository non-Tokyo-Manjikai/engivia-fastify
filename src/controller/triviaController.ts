import { FastifyInstance } from 'fastify';
import { updateTrivia } from '../service/trivia/updateTrivia';

type putBody = {
  id: number;
  content: string;
}

export async function triviaController(
  fastify: FastifyInstance,
): Promise<void> {

  fastify.put<{ Body: putBody }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultUpdateBroadcastInfo = await updateTrivia({
      ...req.body,
      token,
    });
    res.send(resultUpdateBroadcastInfo);
  });

}
