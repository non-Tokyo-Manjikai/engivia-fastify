import { FastifyInstance } from 'fastify';
import { getBroadcastInfo } from '../service/broadcast/getBroadcastInfo';
import { createBroadcastInfo } from '../service/broadcast/createBroadcastInfo';
import { updateBroadcastInfo } from '../service/broadcast/updateBroadcastInfo'
import { deleteBroadcastInfo } from '../service/broadcast/deleteBroadcastInfo'

type postBody = {
  title: string;
  scheduledStartTime: string;
};

type putBody = {
  id: number;
  title?: string;
  scheduledStartTime?: string;
  status?: string;
  archiveUrl?: string;
}

export async function broadcastController(
  fastify: FastifyInstance,
): Promise<void> {
  // 放送情報取得
  fastify.get<{
    Params: { id: number };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    const token = req?.headers?.authorization?.split(' ')[1] as string;

    const resultBroadcastInfo = await getBroadcastInfo({
      id: Number(id),
      token,
    });
    res.send(resultBroadcastInfo);
  });

  fastify.post<{ Body: postBody }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultCreateBroadcastInfo = await createBroadcastInfo({
      title: req.body.title,
      scheduledStartTime: req.body.scheduledStartTime,
      token,
    });
    res.send(resultCreateBroadcastInfo);
  });

  fastify.put<{ Body: putBody }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultUpdateBroadcastInfo = await updateBroadcastInfo({
      ...req.body,
      token,
    });
    res.send(resultUpdateBroadcastInfo);
  });

  fastify.delete<{
    Params: { id: number };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    const token = req?.headers?.authorization?.split(' ')[1] as string;

    const resultDeleteBroadcastInfo = await deleteBroadcastInfo({
      id: Number(id),
      token,
    });
    res.send(resultDeleteBroadcastInfo);
  });
}
