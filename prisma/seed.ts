import { PrismaClient } from '.prisma/client';

const sampleImage =
  'https://secure.gravatar.com/avatar/e57b3678017c2e646e065d9803735508.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0013-512.png';

async function main() {
  const prisma = new PrismaClient();
  // サンプル放送作成
  const createManyBroadcast = prisma.broadcast.createMany({
    data: [
      {
        id: 1,
        title: '第１回エンジビアの泉',
        scheduledStartTime: '2021-10-01T19:00:00Z',
        status: 'ended',
      },
      {
        id: 2,
        title: '第２回エンジビアの泉',
        scheduledStartTime: '2021-10-10T12:00:00Z',
        status: 'live',
      },
      {
        id: 3,
        title: '第３回エンジビアの泉',
        scheduledStartTime: '2021-10-20T20:00:00Z',
        status: 'upcoming',
      },
    ],
  });

  // サンプルユーザー１作成
  const createUser1 = prisma.user.create({
    data: {
      id: 'user1',
      name: 'テストユーザー１',
      image: sampleImage,
      token: 'token1',
      Trivia: {
        createMany: {
          data: [
            {
              content: 'ユーザー１が放送１に投稿したトリビアの内容',
              broadcastId: 1,
            },
            {
              content: 'ユーザー１が放送２に投稿したトリビアの内容',
              broadcastId: 2,
            },
            {
              content: 'ユーザー１が放送３に投稿したトリビアの内容',
              broadcastId: 3,
            },
          ],
        },
      },
    },
  });

  // サンプルユーザー２作成
  const createUser2 = prisma.user.create({
    data: {
      id: 'user2',
      name: 'テストユーザー２',
      image: sampleImage,
      token: 'token2',
      Trivia: {
        createMany: {
          data: [
            {
              content: 'ユーザー２が放送１に投稿したトリビアの内容',
              broadcastId: 1,
            },
          ],
        },
      },
    },
  });

  // サンプルユーザー３作成
  const createUser3 = prisma.user.create({
    data: {
      id: 'user3',
      name: 'テストユーザー３',
      image: sampleImage,
      token: 'token3',
      Trivia: {
        createMany: {
          data: [
            {
              content: 'ユーザー３が放送１に投稿したトリビアの内容',
              broadcastId: 1,
            },
            {
              content: 'ユーザー３が放送３に投稿したトリビアの内容',
              broadcastId: 3,
            },
          ],
        },
      },
    },
  });

  await prisma.$transaction([
    createManyBroadcast,
    createUser1,
    createUser2,
    createUser3,
  ]);
}

main();
