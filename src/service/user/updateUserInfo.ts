import { PrismaClient } from '.prisma/client';

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const updateUserInfo = async ( params: {
  token: string;
  name: string;
  image: string;
} ) =>
{
  if ( !params.token )
  {
    throw new Error( 'Specify id token' );
  }

  try
  {
    const resultUpdateBroadcast = await prisma.user.update( {
      where: { id: params.token },
      data: {
        name: params.name,
        image: params.image,
      }
    } );

    return resultUpdateBroadcast;
  } catch
  {
    throw new Error( '' );
  }
};
