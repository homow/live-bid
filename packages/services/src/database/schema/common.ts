import {v7} from "uuid";
import {timestamp, uuid} from "drizzle-orm/pg-core";

export const baseDrizzleTable = {
  id: uuid('id').primaryKey().$defaultFn(v7),
  created_at: timestamp("created_at", {withTimezone: true}).defaultNow(),
  updated_at: timestamp("updated_at", {withTimezone: true}).defaultNow().$onUpdateFn(() => new Date()),
};
