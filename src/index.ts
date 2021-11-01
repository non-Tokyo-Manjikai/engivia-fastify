import Fastify from "fastify";
import { app } from "./app";

const FASTIFY_PORT = Number(process.env.PORT) || 8080;

async function start() {
  const fastify = Fastify({
    logger: {
      prettyPrint: true,
      level: "info",
    },
  });
  fastify.register(app);

  await fastify.listen(FASTIFY_PORT, "0.0.0.0");
  fastify.log.info(`Fastify server running on port ${FASTIFY_PORT} in ${process.env.NODE_ENV || "development"}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
