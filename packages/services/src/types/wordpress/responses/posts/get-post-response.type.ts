import type {PostWP} from '../../posts';
import type {GraphQLResponseWP} from '../graphql-response.type';

export type GetPostResponseWP = GraphQLResponseWP<{
  post: PostWP | null;
}>;
