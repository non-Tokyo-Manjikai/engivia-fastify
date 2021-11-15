import { FastifyPluginAsync } from 'fastify';
import userPlugin from './service';
import {
  UserInfo,
  userPutBodySchema,
  getUserResponse,
  updateUserResponse,
  deleteUserResponse,
  UserPutBody,
} from './schema';

declare module 'fastify' {
  interface FastifyRequest {
    userInfo: UserInfo;
  }
}

const user: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(userPlugin);
  fastify.decorateRequest('userInfo', null);

  fastify.addHook<{ Body: { token?: string } }>(
    'preHandler',
    async (req, reply, done) => {
      const token = req.body?.token || req.headers.authorization?.split(' ')[1];
      if (!token) {
        reply.code(403);
        done(new Error('Specify token'));
      }
      const userInfo = await fastify.prisma.user.findUnique({
        where: { token },
        select: { id: true, name: true, isAdmin: true, image: true },
      });
      if (userInfo) {
        req.userInfo = userInfo;
        done();
      } else {
        reply.code(403);
        done(new Error('Invalid token'));
      }
    },
  );

  // ユーザー情報取得(bearer tokenで取得)
  fastify.get(
    `/`,
    {
      schema: {
        response: {
          '200': getUserResponse,
        },
      },
    },
    async (req, res) => {
      res.send(req.userInfo);
    },
  );

  // ユーザー情報更新
  fastify.put<{
    Body: UserPutBody;
  }>(
    `/`,
    {
      schema: {
        body: userPutBodySchema,
        response: {
          '200': updateUserResponse,
        },
      },
    },
    async (req, res) => {
      const { name, image, base64Image } = req.body;
      const imageURL = base64Image
        ? await fastify
            .uploadIcon({ id: req.userInfo.id, base64: base64Image })
            .catch(() => {
              throw new Error(`Image upload failed`);
            })
        : image;
      const updatedUser = await fastify.updateUser({
        id: req.userInfo.id,
        name,
        image: imageURL,
      });
      res.send(updatedUser);
    },
  );

  // ユーザー情報削除(bearer tokenで削除)
  fastify.delete(
    `/`,
    {
      schema: {
        response: { '200': deleteUserResponse },
      },
    },
    async (req, res) => {
      const deleteUser = await fastify.deleteUser({ id: req.userInfo.id });
      res.send(deleteUser);
    },
  );
};

export default user;
