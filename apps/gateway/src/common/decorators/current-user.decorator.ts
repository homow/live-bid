import {createParamDecorator} from "@nestjs/common";
import {getRequestResponse} from "@app/gateway/lib/utils";

export const CurrentUser = createParamDecorator((_data: unknown, context) => {
  const ctx = getRequestResponse(context);
  return ctx.req.user;
});
