import type {PostToCategoryConnection, PostToTagConnection, PostToCommentConnection, NodeWithAuthorToUserConnectionEdge, NodeWithFeaturedImageToMediaItemConnectionEdge} from './post-edges.type';

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
  author: NodeWithAuthorToUserConnectionEdge | null;
  categories: PostToCategoryConnection | null;
  tags: PostToTagConnection | null;
  comments: PostToCommentConnection | null;
  featuredImage: NodeWithFeaturedImageToMediaItemConnectionEdge | null;
}
