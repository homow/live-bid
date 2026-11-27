import type { AvatarWP } from './avatar.type';

export interface UserWP {
  id: string;
  databaseId: number;
  username: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  slug: string | null;
  email: string | null;
  url: string | null;
  description: string | null;
  avatar: AvatarWP | null;
  registeredDate: string | null;
  locale: string | null;
}
