import type {Post} from '../../posts';
import type {Connection} from '../../common';
import type {GraphQLResponse} from '../graphql-response.type';

export type GetPostsResponse = GraphQLResponse<{
  posts: Connection<Post> | null;
}>;
