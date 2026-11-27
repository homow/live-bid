import type { PaginationArgs } from '../../queries/pagination-args.type';
import type { PostWhereArgs } from '../../queries/post-where-args.type';

export interface GetPostsVariables extends PaginationArgs {
  where?: PostWhereArgs;
}
