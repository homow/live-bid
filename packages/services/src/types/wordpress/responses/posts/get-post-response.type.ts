import type { Post } from '../../posts/post.type';
import type { GraphQLResponse } from '../graphql-response.type';

export type GetPostResponse = GraphQLResponse<{
  post: Post | null;
}>;
