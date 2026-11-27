import {PostWhereArgsWP, PaginationArgsWP} from "../../queries";

export interface GetPostsVariablesWP extends PaginationArgsWP {
  where?: PostWhereArgsWP;
}
