import type { CommentWP } from "../../comments";
import type { PageInfoWP } from "../../common";
import type { GraphQLResponseWP } from "../graphql-response.type";

export type GetCommentsResponseWP = GraphQLResponseWP<{
  comments: {
    nodes: (CommentWP & {
      replies: {
        nodes: CommentWP[];
      };
    })[];
    pageInfo: PageInfoWP;
  };
}>;
