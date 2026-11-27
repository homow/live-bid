import type {PaginationArgsWP, CommentWhereArgsWP} from '../../queries';

export interface GetCommentsVariablesWP extends PaginationArgsWP {
  where?: CommentWhereArgsWP;
}
