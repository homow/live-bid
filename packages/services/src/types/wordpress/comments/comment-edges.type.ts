import type {PostWP} from '../posts';
import type {CommentWP, CommenterWP} from './comment.type';
import type {ConnectionWP, ConnectionEdgeWP} from '../common';

export interface CommentToCommenterConnectionEdgeWP {
  cursor: string | null;
  email: string | null;
  ipAddress: string | null;
  name: string | null;
  node: CommenterWP;
  url: string | null;
}

export type CommentToContentNodeConnectionEdgeWP = ConnectionEdgeWP<PostWP>;

export type CommentToParentCommentConnectionEdgeWP = ConnectionEdgeWP<CommentWP>;

export type CommentToCommentConnectionEdgeWP = ConnectionEdgeWP<CommentWP>;

export type CommentToCommentConnectionWP = ConnectionWP<CommentWP, CommentToCommentConnectionEdgeWP>;
