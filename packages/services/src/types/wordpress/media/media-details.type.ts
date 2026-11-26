import type {MediaSize} from './media-size.type';
import type {MediaItemMeta} from './media-item-meta.type';

export interface MediaDetails {
  file: string | null;
  filePath: string | null;
  height: number | null;
  meta: MediaItemMeta | null;
  sizes: MediaSize[] | null;
  width: number | null;
}
