import { Type } from '@sinclair/typebox';

export const userResponse = Type.Object({
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

export const userPutBodySchema = Type.Object({
  name: Type.Optional(Type.String({ maxLength: 21 })),
  image: Type.Optional(Type.String({ format: 'uri' })),
  base64Image: Type.Optional(Type.String()),
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
};
