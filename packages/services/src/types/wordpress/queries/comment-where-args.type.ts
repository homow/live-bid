export interface CommentWhereArgs {
  authorEmail?: string | null;
  authorIn?: string[] | null;
  authorNotIn?: string[] | null;
  authorUrl?: string | null;

  commentIn?: string[] | null;
  commentNotIn?: string[] | null;
  commentType?: string | null;
  commentTypeIn?: string[] | null;
  commentTypeNotIn?: string | null;

  contentAuthor?: string[] | null;
  contentAuthorIn?: string[] | null;
  contentAuthorNotIn?: string[] | null;
  contentId?: string | null;
  contentIdIn?: string[] | null;
  contentIdNotIn?: string[] | null;
  contentName?: string | null;
  contentParent?: number | null;
  contentStatus?: string[] | null;
  contentType?: string[] | null;

  includeUnapproved?: string[] | null;
  karma?: number | null;

  order?: string | null;
  orderby?: string | null;

  parent?: number | null;
  parentIn?: string[] | null;
  parentNotIn?: string[] | null;

  search?: string | null;
  statusIn?: string[] | null;
  userId?: string | null;
}
