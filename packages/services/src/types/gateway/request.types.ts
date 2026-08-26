import {UserAccess} from "../auth";
import type {Request} from "express";

export interface AccessRequest extends Request {
  user: UserAccess;
}
