import type { Post } from '../../posts/post.type';
import type { Connection } from '../../common/connection.type';
import type { GraphQLResponse } from '../graphql-response.type';

export type GetPostsResponse = GraphQLResponse<{
  posts: Connection<Post> | null;
}>;
