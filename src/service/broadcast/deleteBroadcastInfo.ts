import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const deleteBroadcastInfo = async (params: {
  id: number;
  token: string;
}) => {
  if (!params.id || !params.token) {
    throw new Error('Specify id token');
  }

  // ユーザー情報取得
  const resultUserInfo = await prisma.user.findUnique({
    where: { token: params.token }
  });

  // 管理者の場合
  if (resultUserInfo?.isAdmin === true) {
    const resultDeleteBroadcast = await prisma.broadcast.delete({
      where: { id: params.id },
      include: {
        Trivia: { where: { broadcastId: params.id }},
      }
    });
    return resultDeleteBroadcast;
  }

  // 管理者ではない場合
  throw new Error('not admin');
};
