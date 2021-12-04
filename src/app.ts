import { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import AutoLoad from 'fastify-autoload';
import fastifyCors from 'fastify-cors';
import fastifyEnv from 'fastify-env';
import s from 'fluent-json-schema';

// デプロイテスト

declare module 'fastify' {
  interface FastifyInstance {
    config: { // this should be same as the confKey in options
      SLACK_CLIENT_ID: string;
      SLACK_CLIENT_SECRET: string;
      SLACK_REDIRECT_URL: string
    };
  }
}

export const app: FastifyPluginAsync = async (fastify, opts) => {
  const schema = s.object()
    .prop('SLACK_CLIENT_ID', s.string().required())
    .prop('SLACK_CLIENT_SECRET', s.string().required())
    .prop('SLACK_REDIRECT_URL', s.string().required())
  // .env読み込む
  fastify.register(fastifyEnv, {
    dotenv: true,
    schema,
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });

  // クライアントからアクセスできるようにする
  // 本番環境ではこの設定良くないかも
  fastify.register(fastifyCors, {
    origin: '*',
  });

};
