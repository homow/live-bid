import type {Request, Response} from "express";

export interface GraphQLContext<T extends Request = Request> {
  req: T;
  res: Response;
}
