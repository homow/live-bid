import type {MediaDetailsWP} from './media-details.type';

export interface MediaItemWP {
  id: string;
  databaseId: number;
  altText: string | null;
  caption: string | null;
  description: string | null;
  mediaItemUrl: string | null;
  sourceUrl: string | null;
  srcSet: string | null;
  sizes: string | null;
  file: string | null;
  filePath: string | null;
  fileSize: number | null;
  mimeType: string | null;
  mediaType: string | null;
  mediaDetails: MediaDetailsWP | null;
  title: string | null;
  slug: string | null;
  date: string | null;
  modified: string | null;
}
