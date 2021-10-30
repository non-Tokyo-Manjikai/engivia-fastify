import { FastifyInstance } from "fastify";
import { slackController } from "./controller/slackController";
import { userController } from "./controller/userController";
import { broadcastController } from "./controller/broadcastController";
import { triviaController } from "./controller/triviaController";

export async function router(fastify: FastifyInstance): Promise<void> {
  fastify.register(slackController, { prefix: '/slack' });
  fastify.register(userController, { prefix: '/user' });
  fastify.register(broadcastController, { prefix: '/broadcast' });
  fastify.register(triviaController, { prefix: '/trivia' });
}
