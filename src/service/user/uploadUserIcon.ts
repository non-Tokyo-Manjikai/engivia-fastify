import { PrismaClient } from '.prisma/client';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: 'ntm-engivia',
  keyFilename: 'gcs-token.json'
});

// できればプラグインのやつ使いたい fastify.prisma
// これだとprismaインスタンスが複数作られてしまうみたい(このようなファイルがたくさんある場合)
const prisma = new PrismaClient();

export const uploadUserIcon = async (params: {
  token: string;
  base64: string;
}) => {
  if (!params.token) {
    throw new Error('Specify id token');
  }

  // ユーザー情報を取得
  const resultUserInfo = await prisma.user.findUnique({
    where: { token: params.token }
  });
  if (!resultUserInfo) {
    throw new Error('not found user');
  }

  const imageBuffer = Buffer.from(params.base64, "base64");
  // ファイルサイズが5MB以上の場合
  if (imageBuffer.length > 5000000) {
    throw new Error('Image files larger than 5MB cannot be uploaded.');
  }
  console.log("Byte length: " + imageBuffer.length);

  // Cloud Storage に画像をアップロード
  const file = storage.bucket('users_icon').file(`${resultUserInfo.id}.png`);
  await file.save(imageBuffer).catch((e) => {
    console.error(e);
    throw new Error('upload failure');
  });

  return `https://storage.googleapis.com/users_icon/${resultUserInfo.id}.png`;
};
