export interface CommentAuthorTypeWP {
  id: string;
  databaseId: number;
  name: string | null;
  email: string | null;
  url: string | null;
  isRestricted: boolean | null;
}
