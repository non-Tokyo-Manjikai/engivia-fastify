import { FastifyPluginAsync } from 'fastify';
import { Socket } from 'socket.io';

const live: FastifyPluginAsync = async (fastify): Promise<void> => {
  // liveプラグインを読み込む！

  fastify.ready().then(() => {
    // 接続状態
    fastify.io.on('connection', async (socket: Socket) => {
      // 初期化
      socket.data.userId = socket.handshake.query.id;
      socket.data.name = socket.handshake.query.name;
      socket.data.image = socket.handshake.query.image;
      socket.data.heeCount = 0;

      const sockets = await fastify.io.fetchSockets();
      const joiningUsers = sockets.map((sock: Socket) => {
        return {
          id: sock.data.userId,
          name: sock.data.name,
          image: sock.data.image,
          heeCount: sock.data.heeCount,
        };
      });
      await fastify.io.emit('get_connect_user', joiningUsers);

      // 管理者がタイトルコールした時、エンジビア情報を受け取る
      socket.on('post_title_call', (data) => {
        console.info(data);
        // 受け取ったエンジビア情報をユーザーに送信
        fastify.io.emit('get_title_call', {
          engivia: {
            id: data.query.id,
            name: data.query.name,
            image: data.query.image,
            content: data.query.content,
            engiviaNumber: data.query.engiviaNumber,
          },
        });
      });

      socket.on('post_wait_engivia', () => {
        // 受け取ったエンジビア情報をユーザーに送信
        fastify.io.emit('get_wait_engivia');
      });

      // ユーザーのへぇリクエストを受け取る
      socket.on('post_hee_user', async (data) => {
        // 他のユーザーにへぇリクエストを送信

        socket.data.heeCount = data.query.count;

        fastify.io.emit('get_hee_user', {
          heeUser: {
            id: socket.data.userId,
            count: socket.data.heeCount,
          },
        });
      });

      socket.on('disconnect', async (reason) => {
        console.log(`bye ${socket.handshake.query.name} reason: ${reason}`);
        const disconnectedSockets = await fastify.io.fetchSockets();
        const disconnectedJoiningUsers = disconnectedSockets.map((sock: Socket) => ({ ...sock.data }));
        // すべてのクライアントに サーバーに接続しているすべてのクライアント情報を送信
        fastify.io.emit('exit_user', disconnectedJoiningUsers);
      });
    });
  });
};

export default live;
