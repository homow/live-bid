import type {MediaSizeWP} from './media-size.type';
import type {MediaItemMetaWP} from './media-item-meta.type';

export interface MediaDetailsWP {
  file: string | null;
  filePath: string | null;
  height: number | null;
  meta: MediaItemMetaWP | null;
  sizes: MediaSizeWP[] | null;
  width: number | null;
}
