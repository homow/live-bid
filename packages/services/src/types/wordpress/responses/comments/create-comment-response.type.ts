import type {CreateCommentPayload} from '../../comments';
import type {GraphQLResponse} from '../graphql-response.type';

export type CreateCommentResponse = GraphQLResponse<{
  createComment: CreateCommentPayload | null;
}>;
