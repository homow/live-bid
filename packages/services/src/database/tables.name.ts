import * as schema from "./schema";
import {PgTable} from "drizzle-orm/pg-core";

export type TablesName = {
  [K in keyof typeof schema]: (typeof schema)[K] extends PgTable ? K : never;
}[keyof typeof schema];
