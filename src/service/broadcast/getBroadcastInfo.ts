import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const getBroadcastInfo = async (option: {
  id: number;
  token?: string;
}) => {
  if (!option.id) {
    throw new Error('Specify id or token');
  }

  // 放送情報取得
  const resultBroadcast = await prisma.broadcast.findUnique({
    where: { id: option.id },
    include: {
      Trivia: {
        include: {
          User: true,
        },
      },
    },
  });
  if (!resultBroadcast) {
    throw new Error('not found Broadcast');
  }

  if (!option.token) {
    return resultBroadcast.status === 'ended'
      ? resultBroadcast
      : { ...resultBroadcast, Trivia: undefined };
  }

  // ユーザー情報を取得
  const resultUserInfo = await prisma.user.findUnique({
    where: { token: option.token },
  });
  if (!resultUserInfo) {
    throw new Error('not found userInfo');
  }

  // ユーザーが管理者の場合
  if (resultUserInfo.isAdmin === true) {
    // 放送情報を取得
    return resultBroadcast;
  }

  // 管理者でない場合
  if (resultUserInfo.isAdmin === false) {
    return resultBroadcast.status === 'ended'
      ? resultBroadcast
      : { ...resultBroadcast, Trivia: undefined };
  }

};
