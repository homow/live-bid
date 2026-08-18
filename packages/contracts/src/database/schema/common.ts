import {v7} from "uuid";
import {timestamp, uuid} from "drizzle-orm/pg-core";

export const baseDrizzleTable = {
  id: uuid('id').primaryKey().$defaultFn(v7),
  createdAt: timestamp("created_at", {withTimezone: true}).defaultNow(),
  updatedAt: timestamp("updated_at", {withTimezone: true}).defaultNow().$onUpdateFn(() => new Date()),
};
