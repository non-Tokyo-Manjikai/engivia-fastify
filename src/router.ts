import { FastifyInstance } from "fastify";
import { slackController } from "./controller/slackController";

export async function router(fastify: FastifyInstance): Promise<void> {
  fastify.register(slackController, { prefix: '/slack' });
}
