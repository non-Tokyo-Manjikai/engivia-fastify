import { Type, Static } from '@sinclair/typebox';

export const triviaPostBodySchema = Type.Object({
  content: Type.String({ maxLength: 100 }),
  broadcastId: Type.Number({ minimum: 1 }),
});

export const triviaPutBpdySchema = Type.Object({
  content: Type.String({ maxLength: 100 }),
  featured: Type.Boolean(),
  hee: Type.Number({ minimum: 1, maximum: 100 }),
});

export const triviaDeleteParamsSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
});

export type TriviaPostBody = Static<typeof triviaPostBodySchema>;
export type TriviaPutBody = Static<typeof triviaPutBpdySchema>;
