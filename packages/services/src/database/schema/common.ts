import {v7} from "uuid";
import {timestamp, uuid} from "drizzle-orm/pg-core";

export const baseDrizzleTable = {
  // Unique ID (UUIDv7)
  id: uuid('id')
    .primaryKey()
    .$defaultFn(v7),

  // Created at
  created_at: timestamp("created_at", {withTimezone: true})
    .notNull()
    .defaultNow(),

  // Updated at
  updated_at: timestamp("updated_at", {withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};
