import type { CreateCommentPayload } from '../../comments/create-comment-payload.type';
import type { GraphQLResponse } from '../graphql-response.type';

export type CreateCommentResponse = GraphQLResponse<{
  createComment: CreateCommentPayload | null;
}>;
