import { WordpressPost } from "./post.type";

export interface WordpressPostConnection {
  nodes: WordpressPost[];

  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}