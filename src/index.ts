import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import { router } from './router';

const app = fastify();
const port = process.env.PORT || '8000';

app.register(router);

app.get('/', async (req, res) => {
  return { hello: 'world!!!' };
});

// Run the server!
const start = async () => {
  try {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server ready at: http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
