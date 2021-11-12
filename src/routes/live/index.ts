import { FastifyPluginAsync } from 'fastify';
import { Socket } from 'socket.io';

const live: FastifyPluginAsync = async (fastify): Promise<void> => {
  // liveプラグインを読み込む！

  fastify.ready().then(() => {
    // 接続状態
    fastify.io.on('connection', async (socket: Socket) => {
      // console.info('--- ユーザー受信 ---');
      // console.info(socket.handshake.query.id);
      const sockets = await fastify.io.fetchSockets();
      const joiningUsers = sockets.map((sock: Socket) => {
        return {
          ...sock.handshake,
          soketId: socket.id,
          heeCount: 0,
        };
        // return {
        //   id: sock.handshake.query.id,
        //   name: sock.handshake.query.name,
        //   image: sock.handshake.query.image,
        //   heeCount: 0,
        // };
      });
      await fastify.io.emit('user_get_all_user', joiningUsers);

      /* ------- admin ------- */
      // 管理者がタイトルコールした時、エンジビア情報を受け取る
      socket.on('admin_post_title_call', (data) => {
        // console.info('--- タイトルコール受信 ---');
        // console.info(data);

        // 受け取ったエンジビア情報をユーザーに送信
        socket.emit('user_get_title_call', {
          engivia: {
            id: data.query.id,
            name: data.query.name,
            image: data.query.image,
            content: data.query.content,
          },
        });
      });

      socket.on('post_admin_wait_title_call', () => {
        // console.info('--- タイトルコール待ち受け受信 ---');
        // 受け取ったエンジビア情報をユーザーに送信
        socket.emit('user_get_title_call', {});
      });

      /* ------- user ------- */
      // ユーザーのへぇリクエストを受け取る
      socket.on('user_post_hee_count', (data) => {
        // console.info('--- へぇカウント受信 ---');
        // console.info(data);

        // 他のユーザーにへぇリクエストを送信
        socket.emit('user_get_hee_count', {
          heeCount: data.query.heeCount,
        });
      });
    });
  });
};

export default live;
