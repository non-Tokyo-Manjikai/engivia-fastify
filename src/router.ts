import { FastifyInstance } from "fastify";
import { slackController } from "./controller/slackController";
import { userController } from "./controller/userController";

export async function router(fastify: FastifyInstance): Promise<void> {
  fastify.register(slackController, { prefix: '/slack' });
  fastify.register(userController, { prefix: '/user' });
}
