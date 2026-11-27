import type {Post} from '../posts';
import type {Comment} from '../comments';
import type {Connection} from '../common';
import type {PaginationArgs} from './pagination-args.type';
import type {PostWhereArgs} from './post-where-args.type';
import type {CommentWhereArgs} from './comment-where-args.type';

export interface RootQuery {
  posts: (
    args?: PaginationArgs & { where?: PostWhereArgs },
  ) => Connection<Post> | null;

  post: (
    id: string,
    idType?: string,
  ) => Post | null;

  comments: (
    args?: PaginationArgs & { where?: CommentWhereArgs },
  ) => Connection<Comment> | null;

  comment: (
    id: string,
    idType?: string,
  ) => Comment | null;
}
