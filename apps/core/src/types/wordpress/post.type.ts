export interface WordpressPost {
  id: string;
  databaseId: number;

  title: string | null;
  slug: string | null;
  content: string | null;
  excerpt: string | null;

  date: string | null;
  modified: string | null;
  status: string | null;

  commentCount: number | null;
}
