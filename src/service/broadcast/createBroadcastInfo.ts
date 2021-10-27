import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const createBroadcastInfo = async (params: {
  title: string;
  scheduledStartTime: string;
  token: string;
}) => {
  if (!params.title || !params.scheduledStartTime || !params.token) {
    throw new Error('Specify title scheduledStartTime token');
  }

  // ユーザー情報取得
  const resultUserInfo = await prisma.user.findUnique({
    where: { token: params.token }
  });

  // 管理者の場合
  if (resultUserInfo?.isAdmin === true) {
    const resultCreateBroadcast = await prisma.broadcast.create({
      data: {
        title: params.title,
        scheduledStartTime: params.scheduledStartTime
      }
    });
    return resultCreateBroadcast;
  }

  // 管理者ではない場合
  throw new Error('not admin');
};
