import type {Post} from '../../posts';
import type {GraphQLResponse} from '../graphql-response.type';

export type GetPostResponse = GraphQLResponse<{
  post: Post | null;
}>;
