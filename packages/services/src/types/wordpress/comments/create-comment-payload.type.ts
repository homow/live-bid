import type {Comment} from './comment.type';

export interface CreateCommentPayload {
  clientMutationId: string | null;
  comment: Comment | null;
  success: boolean | null;
}
