import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';

const prisma = new PrismaClient();
const app = fastify();
const port = process.env.PORT || '3000';

app.get('/', async (req, res) => {
  return { hello: 'world!!!' };
});

app.post<{
  Body: { name: string | undefined; email: string };
}>(`/signup`, async (req, res) => {
  const { name, email } = req.body;

  const result = await prisma.user.create({
    data: {
      name,
      email,
    },
  });
  res.send(result);
});

app.get<{
  Params: { id: number };
}>(`/user/:id`, async (req, res) => {
  const { id } = req.params;

  const post = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  res.send(post);
});

app.delete<{
  Params: { id: number }
}>(`/user/:id`, async (req, res) => {
  const { id } = req.params;

  const user_del = await prisma.user.delete({
    where: { id: Number(id) },
  });
  res.send(user_del);
})

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
