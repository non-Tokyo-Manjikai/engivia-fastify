import { PrismaClient } from ".prisma/client"

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const getUserInfo = async ( params: {
  id?: string;
  token?: string;
} ) =>
{
  if ( !params.id && !params.token )
  {
    throw new Error( 'Specify id or token' )
  }

  try
  {
    // id がある場合は、id で user 検索
    if ( params.id )
    {
      const resultUserInfo = await prisma.user.findUnique( {
        // findUnique は where条件に id しか使えない
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          image: true,
          isAdmin: true
        },
      } );
      return resultUserInfo;
    }

    // token がある場合は、token で user を検索
    const resultUserInfo = await prisma.user.findFirst( {
      where: { token: params.token },
      select: {
        id: true,
        name: true,
        image: true,
        isAdmin: true
      }
    } );

    return resultUserInfo;
  } catch
  {
    throw new Error( '' );
  }
}
