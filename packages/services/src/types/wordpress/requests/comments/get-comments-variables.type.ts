import type { PaginationArgs } from '../../queries/pagination-args.type';
import type { CommentWhereArgs } from '../../queries/comment-where-args.type';

export interface GetCommentsVariables extends PaginationArgs {
  where?: CommentWhereArgs;
}
