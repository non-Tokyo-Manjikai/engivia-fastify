import { Type, Static } from '@sinclair/typebox';

export const triviaPostBodySchema = Type.Object({
  content: Type.String({ maxLength: 100 }),
  broadcastId: Type.Number({ minimum: 1 }),
});

export const triviaPutBpdySchema = Type.Object({
  content: Type.Optional(Type.String({ maxLength: 100 })),
  featured: Type.Optional(Type.Boolean()),
  hee: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
});

export const triviaDeleteParamsSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
});

export const triviaPostPutDeleteResponseSchema = Type.Object({
  id: Type.Number(),
  content: Type.String(),
  hee: Type.Union([Type.Number(), Type.Null()]),
  featured: Type.Boolean(),
  userId: Type.String(),
  broadcastId: Type.Number()
});

export type TriviaPostBody = Static<typeof triviaPostBodySchema>;
export type TriviaPutBody = Static<typeof triviaPutBpdySchema>;
