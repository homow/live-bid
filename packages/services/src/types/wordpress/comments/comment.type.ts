import type {User} from '../users';
import type {Post} from '../posts';
import type {CommentAuthorType} from '../users';

export type Commenter = User | CommentAuthorType;

export interface Comment {
  id: string;
  databaseId: number;
  content: string | null;
  date: string | null;
  dateGmt: string | null;
  status: string | null;
  type: string | null;
  author: Commenter | null;
  commentedOn: Post | null;
  parent: Comment | null;
  parentDatabaseId: number | null;
  parentId: string | null;
  replies: Comment[] | null;
  agent: string | null;
  karma: number | null;
  link: string | null;
  uri: string | null;
}
