import {applyDecorators} from "@nestjs/common";
import {Public} from "@app/gateway/common/decorators";

export const GetPostDecorators = () => applyDecorators(
  Public()
);
