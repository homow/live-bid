// What core sends over Redis. Small on purpose: gateway and clients never see raw WP types.
export interface BlogImageDto {
  url: string;
  alt: string;
  width: number | null;
  height: number | null
}

export interface BlogCategoryDto {
  id: number;
  slug: string;
  name: string;
  count: number
}

export interface BlogPostSummaryDto {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string | null;
  modified: string | null;
  commentCount: number;
  image: BlogImageDto | null;
  categories: BlogCategoryDto[];
}

export interface BlogPostDto extends BlogPostSummaryDto {
  content: string;
  commentsOpen: boolean
}

export interface BlogCommentDto {
  id: number;
  content: string;
  date: string | null;
  authorName: string;
  replies: BlogCommentDto[];
}

export interface BlogPageInfoDto {
  hasNextPage: boolean;
  endCursor: string | null
}

export interface BlogConnectionDto<T> {
  items: T[];
  pageInfo: BlogPageInfoDto
}

export interface BlogPostsPayload {
  first?: number;
  after?: string;
  categoryId?: number
}

export interface BlogPostPayload {slug: string}

export interface BlogCommentsPayload {
  postId: number;
  first?: number;
  after?: string
}

export interface CreateBlogCommentPayload {
  postId: number;
  content: string;
  author: string;
  authorEmail?: string;
  parentId?: number;
  client?: { ip?: string; userAgent?: string };
}
