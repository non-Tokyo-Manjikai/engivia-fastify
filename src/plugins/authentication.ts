import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userInfo: {
      id: string;
      name: string;
      isAdmin: boolean;
      image: string;
    };
  }
}

const authenticationPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorateRequest('userInfo', null);
  fastify.addHook(`preValidation`, async (req, reply) => {
    // 放送一覧を取得する時は、事前に認証処理は必要ない
    if (req.url === '/broadcast' && req.method === 'GET') return;
    
    // Slack認証をする時は、事前に認証処理は必要ない
    const slackUrlRegexp = /\/slack\/[^/]+$/;
    if (slackUrlRegexp.test(req.url)) return;

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      reply.code(403);
      throw new Error('Specify token');
    }

    const userInfo = await fastify.prisma.user.findUnique({
      where: { token },
      select: { id: true, name: true, isAdmin: true, image: true },
    });

    if (!userInfo) {
      reply.code(403);
      throw new Error('Invalid token');
    }

    req.userInfo = userInfo;
  });
});

export default authenticationPlugin;
