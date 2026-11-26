export interface PostWhereArgs {
  author?: number | null;
  authorIn?: string[] | null;
  authorName?: string | null;
  authorNotIn?: string[] | null;

  categoryId?: number | null;
  categoryIn?: string[] | null;
  categoryName?: string | null;
  categoryNotIn?: string[] | null;

  hasPassword?: boolean | null;
  id?: number | null;
  in?: string[] | null;
  isSticky?: boolean | null;
  name?: string | null;
  nameIn?: string[] | null;
  notIn?: string[] | null;

  parent?: string | null;
  parentIn?: string[] | null;
  parentNotIn?: string[] | null;
  password?: string | null;

  search?: string | null;
  stati?: string[] | null;
  status?: string | null;

  tag?: string | null;
  tagId?: string | null;
  tagIn?: string[] | null;
  tagNotIn?: string[] | null;
  tagSlugAnd?: string[] | null;
  tagSlugIn?: string[] | null;
}
