import fastify from 'fastify';
import prismaPlugin from './plugins/prisma';
import { router } from './router';

const app = fastify();
const port = process.env.PORT || '8000';

app.register( prismaPlugin );
app.register( router );

/* =============== */
/* 一旦コメントアウト */
/* =============== */

// // ユーザー
// app.post<{
//   Body: { id: string; name: string; image: string; token: string };
// }>( `/signup`, async ( req, res ) =>
// {
//   const { id, name, image, token } = req.body;
//   const result = await prisma.user.create( {
//     data: {
//       id, // slack認証
//       name, // slackのユーザー名
//       // isAdmin: false,
//       image,
//       token, // slack認証
//     },
//   } );
//   res.send( result );
// } );
// // 放送リスト取得
// app.get( `/broadcastList`, async ( req, res ) =>
// {
//   const user_del = await prisma.broadcast.findMany( {
//     select: {
//       id: true,
//       title: true,
//       scheduledStartTime: true,
//       status: true,
//       _count: true,
//     },
//   } );
//   res.send( user_del );
// } );

// Run the server!
const start = async () =>
{
  try
  {
    await app.listen( port, '0.0.0.0' );
    console.log( `🚀 Server ready at: http://localhost:${ port }` );
  } catch ( err )
  {
    app.log.error( err );
    process.exit( 1 );
  }
};

start();
