import type { Connection, ConnectionEdge } from '../common/connection.type';
import type { User } from '../users/user.type';
import type { MediaItem } from '../media/media-item.type';
import type { Category } from '../taxonomy/category.type';
import type { Tag } from '../taxonomy/tag.type';
import type { Comment } from '../comments/comment.type';

export interface NodeWithAuthorToUserConnectionEdge
  extends ConnectionEdge<User> {}

export interface NodeWithFeaturedImageToMediaItemConnectionEdge
  extends ConnectionEdge<MediaItem> {}

export interface PostToCategoryConnectionEdge
  extends ConnectionEdge<Category> {}

export interface PostToTagConnectionEdge
  extends ConnectionEdge<Tag> {}

export interface PostToCommentConnectionEdge
  extends ConnectionEdge<Comment> {}

export type PostToCategoryConnection = Connection<Category, PostToCategoryConnectionEdge>;
export type PostToTagConnection = Connection<Tag, PostToTagConnectionEdge>;
export type PostToCommentConnection = Connection<Comment, PostToCommentConnectionEdge>;
