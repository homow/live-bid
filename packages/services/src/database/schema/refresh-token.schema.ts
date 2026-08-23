import {user} from "./user.schema";
import {baseDrizzleTable} from "./common";
import type {NormalizeClientInfoType} from "../../types";
import {AnyPgColumn, boolean, index, jsonb, pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const refreshToken = pgTable(
  "refresh_tokens",
  {
    ...baseDrizzleTable,
    user_id: uuid("user_id").notNull().references(() => user.id, {onDelete: "cascade"}),
    token_hash: varchar("token_hash", {length: 64}).notNull(),
    is_revoked: boolean("is_revoked").default(false).notNull(),
    expires_in: timestamp("expires_in", {withTimezone: true}).notNull(),
    replace_by_token_id: uuid("replace_by_token_id").references((): AnyPgColumn => refreshToken.id, {onDelete: "set null"}),
    client_info: jsonb("client_info").$type<NormalizeClientInfoType>(),
  },
  // Indexes
  (table) => [
    index("refresh_tokens_user_id_idx").on(table.user_id),
    index("refresh_tokens_expires_idx").on(table.expires_in),
  ]
);

export type RefreshToken = typeof refreshToken.$inferSelect;
