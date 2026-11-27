import type { CommentWP } from "../../comments";
import type { GraphQLResponseWP } from "../graphql-response.type";

export type CreateCommentResponseWP = GraphQLResponseWP<{
  createComment: {
    success: boolean;
    comment: CommentWP | null;
  } | null;
}>;
