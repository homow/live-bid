import type {CommentStatusEnum} from '../../../enums';

export interface CreateCommentInput {
  author?: string;
  authorEmail?: string;
  authorUrl?: string;
  clientMutationId?: string;
  commentOn?: number;
  content?: string;
  date?: string;
  parent?: string;
  status?: CommentStatusEnum;
  type?: string;
}
