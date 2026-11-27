import type {PostWP} from '../../posts';
import type {ConnectionWP} from '../../common';
import type {GraphQLResponseWP} from '../graphql-response.type';

export type GetPostsResponseWP = GraphQLResponseWP<{
  posts: ConnectionWP<PostWP> | null;
}>;
