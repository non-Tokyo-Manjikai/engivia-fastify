import { Type, Static } from '@sinclair/typebox';

export const broadcastParamsSchema = Type.Object({
  id: Type.Number(),
});

export const broadcastPostBodySchema = Type.Object({
  title: Type.String(),
  scheduledStartTime: Type.String({ format: 'date-time' }),
});

export const broadcastPutBodySchema = Type.Object({
  title: Type.Optional(Type.String()),
  scheduledStartTime: Type.Optional(Type.String({ format: 'date-time' })),
  status: Type.Optional(Type.String({ pattern: 'upcoming|live|ended' })),
  archiveUrl: Type.Optional(Type.String({ format: 'uri' })),
});

export type BroadcastPostBody = Static<typeof broadcastPostBodySchema>;
export type BroadcastPutBody = Static<typeof broadcastPutBodySchema>;

export const broadcastListGetResponseSchema = Type.Array(
  Type.Object({
    id: Type.String(),
    title: Type.String(),
    scheduledStartTime: Type.String(),
    status: Type.String(),
    _count: Type.Union([Type.Object({ Trivia: Type.Number() }), Type.Null()]),
  }),
);

export const broadcastGetResponseSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  scheduledStartTime: Type.String(),
  status: Type.String(),
  archiveUrl: Type.Union([Type.String(), Type.Null()]),
  Trivia: Type.Array(
    Type.Object({
      id: Type.Number(),
      content: Type.String(),
      hee: Type.Union([Type.Number(), Type.Null()]),
      featured: Type.Boolean(),
      User: Type.Object({
        id: Type.String(),
        name: Type.String(),
        image: Type.String(),
      }),
    }),
  ),
});

export const broadcastPostPutDeleteResponseSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  scheduledStartTime: Type.String(),
  status: Type.String(),
  archiveUrl: Type.Union([Type.String(), Type.Null()]),
})
