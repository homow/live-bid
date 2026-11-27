import {PostWhereArgs, PaginationArgs} from "../../queries";

export interface GetPostsVariables extends PaginationArgs {
  where?: PostWhereArgs;
}
