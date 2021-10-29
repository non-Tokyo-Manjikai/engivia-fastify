import { FastifyInstance } from "fastify";
import { OpenIDConnectUserInfoResponse, WebClient } from "@slack/web-api";
import { PrismaClient } from ".prisma/client";
import jwt_decode from "jwt-decode";

const web = new WebClient();
const prisma = new PrismaClient();

export async function slackController(fastify: FastifyInstance): Promise<void> {
  // Slack認証画面にリダイレクト
  fastify.get('/signin', async (req, res) => {
    res.redirect(
      `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile&client_id=${process.env.SLACK_CLIENT_ID}&state=af0ifjsldkj&nonce=abcd&redirect_uri=${process.env.SLACK_REDIRECT_URL}`
    );
  });

  fastify.get<{ Querystring: { code: string } }>('/token', async (req, res) => {
    // アクセストークンやIDトークンを取得
    const result = await web.openid.connect.token({
      client_id: process.env.SLACK_CLIENT_ID || '',
      client_secret: process.env.SLACK_CLIENT_SECRET || '',
      code: req.query.code,
    });
    if (!result.id_token || !result.access_token) {
      res.status(400).send({ error: 'not found id_token or access_token' });
      return;
    }
    res.send(result);

    // id_token をデコードしてユーザー情報を取得
    const userInfo: OpenIDConnectUserInfoResponse = jwt_decode(result.id_token);
    if (!userInfo["https://slack.com/user_id"] || !userInfo.name || !userInfo.picture) {
      res.status(400).send({ error: 'not found user_id or name or picture' });
      return;
    }

    // ユーザー情報をDBに保存
    const registerUser = await prisma.user.upsert({
      where: { id: userInfo["https://slack.com/user_id"] },
      create: {
        id: userInfo["https://slack.com/user_id"],
        name: userInfo.name,
        image: userInfo.picture,
        token: result.access_token
      },
      update: {}
    })
    res.send(registerUser);
  });

  /*
  // アクセストークンを使ってユーザー情報を取得
  fastify.get('/userInfo', async (req, res) => {
    const token = req?.headers?.authorization?.split(" ")[1] as string;
    // アクセストークンやIDトークンを取得
    const userInfo = await web.openid.connect.userInfo({
      token,
    });
    if (!userInfo["https://slack.com/user_id"] || !userInfo.name || !userInfo.picture) {
      res.status(400).send({ error: 'not found user_id or name or picture' });
      return;
    }

    // ユーザー情報をDBに保存
    const registerUser = await prisma.user.upsert({
      where: { id: userInfo["https://slack.com/user_id"] },
      create: {
        id: userInfo["https://slack.com/user_id"],
        name: userInfo.name,
        image: userInfo.picture,
        token
      },
      update: {}
    })
    res.send(registerUser);
  });
  */
}
