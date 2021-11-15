import { Trivia, User } from '@prisma/client';
import { Type } from '@sinclair/typebox';

export const getUserResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  image: Type.String(),
  isAdmin: Type.Boolean(),
})

export const updateUserResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  image: Type.String(),
})

export const deleteUserResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  image: Type.String(),
  isAdmin: Type.Boolean(),
  token: Type.String(),
})

export const userPutBodySchema = Type.Object({
  name: Type.Optional(Type.String({ maxLength: 21 })),
  image: Type.Optional(Type.String({ format: 'uri' })),
  base64: Type.Optional(Type.String()),
  token: Type.String()
});

export type UserInfo = {
  name: string;
  image: string;
  id: string;
  isAdmin: boolean;
}

export type UserPutBody = {
  name?: string;
  image?: string;
  base64Image?: string;
  token: string;
};

export type DeleteUserResult = User & {
  Trivia: Trivia[];
}
