import type {MediaDetails} from './media-details.type';

export interface MediaItem {
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
  mediaDetails: MediaDetails | null;
  title: string | null;
  slug: string | null;
  date: string | null;
  modified: string | null;
}
