import type {Post} from '../posts';
import type {Comment} from './comment.type';
import type {User, CommentAuthorType} from '../users';
import type {Connection, ConnectionEdge} from '../common/connection.type';

export type Commenter = User | CommentAuthorType;

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
