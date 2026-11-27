import type { Comment } from "../../comments";
import type { PageInfo } from "../../common";
import type { GraphQLResponse } from "../graphql-response.type";

export type GetCommentsResponse = GraphQLResponse<{
  comments: {
    nodes: (Comment & {
      replies: {
        nodes: Comment[];
      };
    })[];
    pageInfo: PageInfo;
  };
}>;
