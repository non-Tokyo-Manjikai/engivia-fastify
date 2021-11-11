import { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import AutoLoad from 'fastify-autoload';
import fastifyCors from 'fastify-cors';
import fastifyIO from 'fastify-socket.io';

export const app: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });

  fastify.register(fastifyIO, {
    path: '/live',
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  // クライアントからアクセスできるようにする
  // 本番環境ではこの設定良くないかも
  fastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
};
