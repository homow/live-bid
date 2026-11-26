import type {Post} from '../posts';
import type {Comment, Commenter} from './comment.type';
import type {Connection, ConnectionEdge} from '../common';

export interface CommentToCommenterConnectionEdge {
  cursor: string | null;
  email: string | null;
  ipAddress: string | null;
  name: string | null;
  node: Commenter;
  url: string | null;
}

export type CommentToContentNodeConnectionEdge = ConnectionEdge<Post>;

export type CommentToParentCommentConnectionEdge = ConnectionEdge<Comment>;

export type CommentToCommentConnectionEdge = ConnectionEdge<Comment>;

export type CommentToCommentConnection = Connection<Comment, CommentToCommentConnectionEdge>;
