import {CommentAuthorTypeWP, UserWP} from "../users";
import type {CommentToCommenterConnectionEdgeWP, CommentToContentNodeConnectionEdgeWP, CommentToParentCommentConnectionEdgeWP, CommentToCommentConnectionWP} from './comment-edges.type';

export type CommenterWP = UserWP | CommentAuthorTypeWP;

export interface CommentWP {
  id: string;
  databaseId: number;
  content: string | null;
  date: string | null;
  dateGmt: string | null;
  status: string | null;
  type: string | null;
  author: CommentToCommenterConnectionEdgeWP | null;
  commentedOn: CommentToContentNodeConnectionEdgeWP | null;
  parent: CommentToParentCommentConnectionEdgeWP | null;
  parentDatabaseId: number | null;
  parentId: string | null;
  replies: CommentToCommentConnectionWP | null;
  agent: string | null;
  karma: number | null;
  link: string | null;
  uri: string | null;
}
