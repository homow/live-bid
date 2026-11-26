import type {PageInfo} from './page-info.type';

export interface ConnectionEdge<TNode> {
  cursor: string | null;
  node: TNode;
}

export interface Connection<TNode, TEdge extends ConnectionEdge<TNode> = ConnectionEdge<TNode>> {
  edges: TEdge[] | null;
  nodes: TNode[] | null;
  pageInfo: PageInfo;
}
