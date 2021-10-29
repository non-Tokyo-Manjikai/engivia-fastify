import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const deleteUserInfo = async ( params: {
  id: string;
  token: string;
} ) =>
{
  if ( !params.id || !params.token )
  {
    throw new Error( 'Specify id token' );
  }

  try
  {
    const resultGetUser = await prisma.user.findFirst( {
      where: { token: params.token }
    } );

    if ( resultGetUser )
    {
      // ユーザーが投稿したトリビアを全て削除
      await prisma.trivia.deleteMany( {
        where: { userId: resultGetUser.id },
      } )

      const deleteUser = await prisma.user.delete( {
        where: { id: resultGetUser.id },
      } );

      return deleteUser
    }
  } catch
  {
    throw new Error( '' );
  }
};
