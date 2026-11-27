import type {CreateCommentInput, CreateCommentPayload} from '../comments';

export interface RootMutation {
  createComment: (
    input: CreateCommentInput,
  ) => CreateCommentPayload | null;
}
