import { FastifyPluginAsync } from 'fastify';
import userPlugin from './service';
import {
  userPutBodySchema,
  userResponse,
  updateUserResponse,
  UserPutBody,
} from './schema';

const user: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(userPlugin);

  // ユーザー情報取得(bearer tokenで取得)
  fastify.get(
    `/`,
    {
      schema: {
        response: {
          '200': userResponse,
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
        response: { '200': userResponse },
      },
    },
    async (req, res) => {
      const deleteUser = await fastify.deleteUser({ id: req.userInfo.id });
      res.send(deleteUser);
    },
  );
};

export default user;
