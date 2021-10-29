import { FastifyInstance } from "fastify";
import { getUserInfo } from "../service/user/getUserInfo";
import { updateUserInfo } from "../service/user/updateUserInfo";
import { deleteUserInfo } from "../service/user/deleteUserInfo";

export async function userController ( fastify: FastifyInstance ): Promise<void>
{
  // ユーザー情報取得(idで取得)
  fastify.get<{
    Params: { id: string };
  }>( `/:id`, async ( req, res ) =>
  {
    const { id } = req.params;
    const resultUser = await getUserInfo( { id } );
    res.send( resultUser );
  } );

  // ユーザー情報取得(bearer tokenで取得)
  fastify.get( `/`, async ( req, res ) =>
  {
    const token = req?.headers?.authorization?.split( " " )[ 1 ] as string;
    const resultUser = await getUserInfo( { token } );
    res.send( resultUser );
  } );

  // ユーザー情報更新(bearer tokenで更新)
  fastify.put<{
    Body: { name: string, image: string, };
  }>( `/:id`, async ( req, res ) =>
  {
    const { name, image } = req.body
    const token = req?.headers?.authorization?.split( " " )[ 1 ] as string;
    const updateUser = await updateUserInfo( { token, name, image } );
    res.send( updateUser );
  } )

  // ユーザー情報削除(bearer tokenで削除)
  fastify.delete<{
    Params: { id: string };
  }>( `/:id`, async ( req, res ) =>
  {
    const { id } = req.params;
    const token = req?.headers?.authorization?.split( " " )[ 1 ] as string;
    const deleteUser = await deleteUserInfo( { id, token } );
    res.send( deleteUser );
  } )
}
