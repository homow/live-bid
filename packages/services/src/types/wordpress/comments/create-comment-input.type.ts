import type {CommentStatusEnumWP} from '../../../enums';

export interface CreateCommentInputWP {
  author?: string;
  authorEmail?: string;
  authorUrl?: string;
  clientMutationId?: string;
  commentOn?: number;
  content?: string;
  date?: string;
  parent?: string;
  status?: CommentStatusEnumWP;
  type?: string;
}
