import { FastifyPluginAsync } from "fastify";
import broadcastPlugin from "./service";

type PostBody = {
  title: string;
  scheduledStartTime: string;
};

type PutBody = {
  id: number;
  title?: string;
  scheduledStartTime?: string;
  status?: string;
  archiveUrl?: string;
}

const broadcast: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Broadcastプラグインを読み込む！
  await fastify.register(broadcastPlugin);

  // 放送リスト取得機能
  fastify.get('/', async (req, res) => {
    const resultBroadcastList = await fastify.getBroadcastList();
    res.send(resultBroadcastList);
  })

  // 放送情報取得
  fastify.get<{
    Params: { id: number };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    const resultBroadcastInfo = await fastify.getBroadcast({
      id: Number(id),
      token,
    });
    res.send(resultBroadcastInfo);
  });

  // 放送作成機能
  fastify.post<{ Body: PostBody }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultCreateBroadcastInfo = await fastify.createBroadcast({
      title: req.body.title,
      scheduledStartTime: req.body.scheduledStartTime,
      token,
    });
    res.send(resultCreateBroadcastInfo);
  });

  // 放送情報更新機能
  fastify.put<{ Body: PutBody }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultUpdateBroadcastInfo = await fastify.updateBroadcast({
      ...req.body,
      token,
    });
    res.send(resultUpdateBroadcastInfo);
  });

  // 放送削除機能
  fastify.delete<{
    Params: { id: number };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    const token = req?.headers?.authorization?.split(' ')[1] as string;
    const resultDeleteBroadcastInfo = await fastify.deleteBroadcast({
      id: Number(id),
      token,
    });
    res.send(resultDeleteBroadcastInfo);
  });
}

export default broadcast;
