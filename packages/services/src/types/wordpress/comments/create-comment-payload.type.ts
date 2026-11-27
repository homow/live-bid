import type {CommentWP} from './comment.type';

export interface CreateCommentPayloadWP {
  clientMutationId: string | null;
  comment: CommentWP | null;
  success: boolean | null;
}
