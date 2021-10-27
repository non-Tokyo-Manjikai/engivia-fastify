import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const updateBroadcastInfo = async (params: {
  id: number;
  title?: string;
  scheduledStartTime?: string;
  status?: string;
  archiveUrl?: string;
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
    const resultUpdateBroadcast = await prisma.broadcast.update({
      where: { id: params.id },
      data: {
        title: params.title,
        scheduledStartTime: params.scheduledStartTime,
        status: params.status,
        archiveUrl: params.archiveUrl
      }
    });
    return resultUpdateBroadcast;
  }

  // 管理者ではない場合
  throw new Error('not admin');
};
