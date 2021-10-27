import { PrismaClient } from ".prisma/client"

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const getUserInfo = async (option: {
  id?: string;
  token?: string;
}) => {
  if (!option.id && !option.token) {
    throw new Error('Specify id or token')
  }
  if (option.id) {
    // findUnique は where条件に id しか使えない
    const resultUserInfo = await prisma.user.findUnique({
      where: { id: option.id },
      select: {
        id: true,
        name: true,
        image: true,
        isAdmin: true
      },
    });
    return resultUserInfo;
  }
  const resultUserInfo = await prisma.user.findFirst({
    where: { token: option.token },
    select: {
      id: true,
      name: true,
      image: true,
      isAdmin: true
    }
  });
  return resultUserInfo;
}
