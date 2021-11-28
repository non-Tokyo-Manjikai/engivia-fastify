import { Broadcast } from "@prisma/client";

export type GetBroadcastParams = {
  id: number;
  isAdmin?: boolean;
  userId?: string;
};

export type CreateBroadcastParams = {
  title: string;
  scheduledStartTime: string;
};

export type UpdateBroadcastParams = {
  id: number;
  title?: string;
  scheduledStartTime?: string;
  status?: string;
  archiveUrl?: string;
};

export type DeleteBroadcastParams = {
  id: number;
};

export type GetBroadcastListResponse = {
  id: number;
  title: string;
  scheduledStartTime: Date;
  status: string;
  _count: {
    Trivia: number;
  } | null;
}[];

export type GetBroadcastResponse =
  | (Broadcast & {
      Trivia: {
        id: number;
        content: string;
        hee: number | null;
        featured: boolean;
        User: {
          id: string;
          name: string;
          image: string;
        };
      }[];
    })
  | null;
