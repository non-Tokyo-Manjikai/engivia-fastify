import s from "fluent-json-schema";

export const bodyPostTriviaSchema = s.object()
  .prop('content', s.string().maxLength(100).required())
  .prop('broadcastId', s.number().minimum(1).required())
  .prop('token', s.string().required())

export const bodyPutTriviaSchema = s.object()
  .prop('content', s.string().maxLength(100))
  .prop('featured', s.boolean())
  .prop('hee', s.number().minimum(0).maximum(100))
  .prop('token', s.string().required())

export const paramsDeleteTrivia = s.object()
  .prop('id', s.number().minimum(1).required())
