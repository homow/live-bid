import type {PageInfoWP} from './page-info.type';

export interface ConnectionEdgeWP<TNode> {
  cursor: string | null;
  node: TNode;
}

export interface ConnectionWP<TNode, TEdge extends ConnectionEdgeWP<TNode> = ConnectionEdgeWP<TNode>> {
  edges: TEdge[] | null;
  nodes: TNode[] | null;
  pageInfo: PageInfoWP;
}
