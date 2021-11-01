import { FastifyPluginAsync } from "fastify";
import userPlugin from "./service";

type PutBody = { name: string, image: string, base64Image?: string }

const broadcast: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Broadcastプラグインを読み込む！
  await fastify.register(userPlugin);
  // ユーザー情報取得(idで取得)
  fastify.get<{
    Params: { id: string };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    const resultUser = await fastify.getUser({ id });
    res.send(resultUser);
  });

  // ユーザー情報取得(bearer tokenで取得)
  fastify.get(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    const resultUser = await fastify.getUser({ token });
    res.send(resultUser);
  });

  // ユーザー情報更新(bearer tokenで更新)
  fastify.put<{
    Body: PutBody;
  }>(`/`, async (req, res) => {
    const { name, image, base64Image } = req.body
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    const imageURL = base64Image ? await fastify.uploadIcon({ token, base64: base64Image }) : image
    const updateUser = await fastify.updateUser({ token, name, image: imageURL });
    res.send(updateUser);
  })

  // ユーザー情報削除(bearer tokenで削除)
  fastify.delete<{
    Params: { id: string };
  }>(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    const deleteUser = await fastify.deleteUser({ token });
    res.send(deleteUser);
  })
}

export default broadcast;
