import type {User} from '../users';
import type {Tag} from '../taxonomy';
import type {MediaItem} from '../media';
import type {Category} from '../taxonomy';
import type {Comment} from '../comments/comment.type';

export interface Post {
  id: string;
  databaseId: number;
  title: string | null;
  content: string | null;
  excerpt: string | null;
  slug: string | null;
  date: string | null;
  dateGmt: string | null;
  modified: string | null;
  modifiedGmt: string | null;
  status: string | null;
  commentCount: number | null;
  commentStatus: string | null;
  authorDatabaseId: number | null;
  authorId: string | null;
  featuredImageDatabaseId: number | null;
  featuredImageId: string | null;
  guid: string | null;
  link: string | null;
  uri: string | null;
  isSticky: boolean;
  hasPassword: boolean | null;
  author: User | null;
  categories: Category[] | null;
  tags: Tag[] | null;
  comments: Comment[] | null;
  featuredImage: MediaItem | null;
}
