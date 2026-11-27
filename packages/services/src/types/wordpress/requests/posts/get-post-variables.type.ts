import type { PostIdType } from '../../../../enums/wordpress/post-id-type.enum';

export interface GetPostVariables {
  id: string;
  idType?: PostIdType;
}
