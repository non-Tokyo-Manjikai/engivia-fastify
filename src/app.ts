import { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import AutoLoad from 'fastify-autoload';

export const app: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}
