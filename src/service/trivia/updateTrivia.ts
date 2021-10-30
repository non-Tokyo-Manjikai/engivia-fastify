import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const updateTrivia = async (params: {
  id: number;
  content: string;
  token: string;
}) => {
  if (!params.token) {
    throw new Error('Specify id token');
  }

  // ユーザー情報とユーザーが投稿したトリビアを取得
  const resultUserInfo = await prisma.user.findUnique({
    where: { token: params.token },
    include: {
      Trivia: {
        where: { id: params.id }
      }
    }
  });

  if (!resultUserInfo) {
    throw new Error('not found user');
  }

  // ユーザーが管理者の場合、他のユーザーが投稿したトリビアを変更できる
  if (resultUserInfo.isAdmin === true) {
    const resultUpdated = await prisma.trivia.update({
      where: { id: params.id },
      data: {
        content: params.content
      }
    });
    return resultUpdated;
  }

  // 指定したトリビアIDが、ユーザーが投稿したトリビアでない場合
  if (resultUserInfo.Trivia.length === 0) {
    throw new Error('Cannot update trivia for other users');
  }

  const resultUpdated = await prisma.trivia.update({
    where: { id: params.id },
    data: {
      content: params.content,
    },
  });
  return resultUpdated;
};
