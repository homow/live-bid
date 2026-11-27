import {Connection} from "../../common";
import type {Comment} from '../../comments';
import type {GraphQLResponse} from '../graphql-response.type';

export type GetCommentsResponse = GraphQLResponse<{
  comments: Connection<Comment> | null;
}>;
