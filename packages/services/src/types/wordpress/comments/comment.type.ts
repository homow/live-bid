import type {CommentToCommenterConnectionEdge, CommentToContentNodeConnectionEdge, CommentToParentCommentConnectionEdge, CommentToCommentConnection} from './comment-edges.type';

export interface Comment {
  id: string;
  databaseId: number;
  content: string | null;
  date: string | null;
  dateGmt: string | null;
  status: string | null;
  type: string | null;
  author: CommentToCommenterConnectionEdge | null;
  commentedOn: CommentToContentNodeConnectionEdge | null;
  parent: CommentToParentCommentConnectionEdge | null;
  parentDatabaseId: number | null;
  parentId: string | null;
  replies: CommentToCommentConnection | null;
  agent: string | null;
  karma: number | null;
  link: string | null;
  uri: string | null;
}
