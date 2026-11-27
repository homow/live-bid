import type {UserWP} from '../users';
import type {MediaItemWP} from '../media';
import type {CommentWP} from '../comments';
import type {TagWP, CategoryWP} from '../taxonomy';
import type {ConnectionWP, ConnectionEdgeWP} from '../common';

export type NodeWithAuthorToUserConnectionEdgeWP = ConnectionEdgeWP<UserWP>;

export type NodeWithFeaturedImageToMediaItemConnectionEdgeWP = ConnectionEdgeWP<MediaItemWP>;

export type PostToCategoryConnectionEdgeWP = ConnectionEdgeWP<CategoryWP>;

export type PostToTagConnectionEdgeWP = ConnectionEdgeWP<TagWP>;

export type PostToCommentConnectionEdgeWP = ConnectionEdgeWP<CommentWP>;

export type PostToCategoryConnectionWP = ConnectionWP<CategoryWP, PostToCategoryConnectionEdgeWP>;
export type PostToTagConnectionWP = ConnectionWP<TagWP, PostToTagConnectionEdgeWP>;
export type PostToCommentConnectionWP = ConnectionWP<CommentWP, PostToCommentConnectionEdgeWP>;
