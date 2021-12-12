import { FastifyPluginAsync } from 'fastify';
import { RemoteSocket, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { getTitleCallAudio } from '../../lib/textToSpeech';

const live: FastifyPluginAsync = async (fastify): Promise<void> => {
  // liveプラグインを読み込む！

  fastify.ready().then(() => {
    // 接続状態
    fastify.io.on('connection', async (socket: Socket) => {
      // 初期化
      socket.data.userId = socket.handshake.query.id;
      socket.data.name = socket.handshake.query.name;
      socket.data.image = socket.handshake.query.image;
      socket.data.isAdmin = socket.handshake.query.isAdmin;
      socket.data.heeCount = 0;
      console.log(`welcome ${socket.handshake.query.name} id: ${socket.id}`);

      const sockets = await fastify.io.fetchSockets();
      const joiningUsers = sockets.map((sock: RemoteSocket<DefaultEventsMap>) => {
        return {
          id: sock.data.userId,
          name: sock.data.name,
          image: sock.data.image,
          heeCount: Number(sock.data.heeCount),
          isAdmin: sock.data.isAdmin === 'true' ? true : false,
        };
      });
      await fastify.io.emit('get_connect_user', joiningUsers);

      // 管理者がタイトルコールした時、エンジビア情報を受け取る
      socket.on('post_title_call', async (data) => {
        const sound = await getTitleCallAudio(data.query.content);
        // 受け取ったエンジビア情報をユーザーに送信
        fastify.io.emit('get_title_call', {
          engivia: {
            id: data.query.id,
            name: data.query.name,
            image: data.query.image,
            content: data.query.content,
            engiviaNumber: Number(data.query.engiviaNumber),
            heeSound: sound,
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

      // 管理者からのイベントを受け取り、放送終了イベントをユーザーに送信
      socket.on('finish_live', () => {
        fastify.io.emit('finish_live_to_client');
      })

      socket.on('disconnect', async (reason) => {
        console.log(`bye ${socket.handshake.query.name} reason: ${reason}`);
        // 切断されたソケットが消えてないのかもしれないため、disconnectをする。（これでいいかわからん）
        socket.disconnect(true)
        const disconnectedSockets = await fastify.io.fetchSockets();
        const disconnectedJoiningUsers = disconnectedSockets.map((sock: RemoteSocket<DefaultEventsMap>) => {
          return {
            id: sock.data.userId,
            name: sock.data.name,
            image: sock.data.image,
            heeCount: Number(sock.data.heeCount),
            isAdmin: sock.data.isAdmin === 'true' ? true : false,
          };
        });
        // すべてのクライアントに サーバーに接続しているすべてのクライアント情報を送信
        fastify.io.emit('exit_user', disconnectedJoiningUsers);
      });
    });
  });
};

export default live;
