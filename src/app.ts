import { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import AutoLoad from 'fastify-autoload';
import fastifyCors from 'fastify-cors';

export const app: FastifyPluginAsync = async (fastify, opts) => {
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
    origin: "*",
  });
};
