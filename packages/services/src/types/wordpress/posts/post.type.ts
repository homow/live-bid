import type {PostToCategoryConnectionWP, PostToTagConnectionWP, PostToCommentConnectionWP, NodeWithAuthorToUserConnectionEdgeWP, NodeWithFeaturedImageToMediaItemConnectionEdgeWP} from './post-edges.type';

export interface PostWP {
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
  author: NodeWithAuthorToUserConnectionEdgeWP | null;
  categories: PostToCategoryConnectionWP | null;
  tags: PostToTagConnectionWP | null;
  comments: PostToCommentConnectionWP | null;
  featuredImage: NodeWithFeaturedImageToMediaItemConnectionEdgeWP | null;
}
