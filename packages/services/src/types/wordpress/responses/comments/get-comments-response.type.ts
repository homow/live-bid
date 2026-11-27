import type { Comment } from '../../comments/comment.type';
import type { Connection } from '../../common/connection.type';
import type { GraphQLResponse } from '../graphql-response.type';

export type GetCommentsResponse = GraphQLResponse<{
  comments: Connection<Comment> | null;
}>;
