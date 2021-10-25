import { FastifyInstance } from "fastify";
import { getUserInfo } from "../service/getUserInfo";

export async function userController(fastify: FastifyInstance): Promise<void> {
  // ユーザー情報取得(idで取得)
  fastify.get<{
    Params: { id: string };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    const resultUser = await getUserInfo({ id });
    res.send(resultUser);
  });

  // ユーザー情報取得(bearer tokenで取得)
  fastify.get(`/`, async (req, res) => {
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    const resultUser = await getUserInfo({ token });
    res.send(resultUser);
  });

  /*
  fastify.post(`/user`, async (req, res) => {
    const token = req?.headers?.authorization?.split(" ")[1] as string;
  });
  */

  fastify.delete<{
    Params: { id: string };
  }>(`/:id`, async (req, res) => {
    const { id } = req.params;
    console.log("header", req.headers);
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    console.log("token", token);
    // res.send(req.headers);

    const resultGetUser = await fastify.prisma.user.findFirst({
      where: { token }
    });
    if ( !resultGetUser || resultGetUser.id !== id ) {
      res.status(400).send({ error: "error!!!" });
      return;
    }
    // ユーザーが投稿したトリビアを全て削除
    await fastify.prisma.trivia.deleteMany({
      where: { userId: id },
    })
    const deleteUser = await fastify.prisma.user.delete({
      where: { id: resultGetUser.id },
    });
    res.send(deleteUser);

  })


}
