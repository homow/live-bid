import {getRequestResponse} from "@app/gateway/lib";
import {createParamDecorator} from "@nestjs/common";

export const CurrentUser = createParamDecorator((_data: unknown, context) => {
  const ctx = getRequestResponse(context);
  return ctx.req.user;
});
