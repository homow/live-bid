import type { Comment } from "../../comments";
import type { GraphQLResponse } from "../graphql-response.type";

export type CreateCommentResponse = GraphQLResponse<{
  createComment: {
    success: boolean;
    comment: Comment | null;
  } | null;
}>;
