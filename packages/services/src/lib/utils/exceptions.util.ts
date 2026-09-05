import {AppException} from "./app.exceptions";

export function throwNotFoundEx(key: string) {
  return new AppException({
    statusCode: 404,
    code: `${key} not found`,
    message: `${key} does not exist in database, please check phone and try again`,
  });
}
