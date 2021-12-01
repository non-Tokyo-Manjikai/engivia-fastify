export type UpdateTriviaParams = {
  id: number;
  content?: string;
  hee?: number;
  featured?: boolean;
  userId: string;
  isAdmin: boolean;
}

export type CreateTriviaParams = {
  userId: string;
  content: string;
  broadcastId: number;
}

export type DeleteTriviaParams = {
  id: number;
}
