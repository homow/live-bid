import type {PaginationArgs, CommentWhereArgs} from '../../queries';

export interface GetCommentsVariables extends PaginationArgs {
  where?: CommentWhereArgs;
}
