import type {User} from '../users';
import type {MediaItem} from '../media';
import type {Comment} from '../comments';
import type {Tag, Category} from '../taxonomy';
import type {Connection, ConnectionEdge} from '../common';

export type NodeWithAuthorToUserConnectionEdge = ConnectionEdge<User>;

export type NodeWithFeaturedImageToMediaItemConnectionEdge = ConnectionEdge<MediaItem>;

export type PostToCategoryConnectionEdge = ConnectionEdge<Category>;

export type PostToTagConnectionEdge = ConnectionEdge<Tag>;

export type PostToCommentConnectionEdge = ConnectionEdge<Comment>;

export type PostToCategoryConnection = Connection<Category, PostToCategoryConnectionEdge>;
export type PostToTagConnection = Connection<Tag, PostToTagConnectionEdge>;
export type PostToCommentConnection = Connection<Comment, PostToCommentConnectionEdge>;
