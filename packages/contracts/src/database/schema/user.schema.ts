import {baseDrizzleTable} from "./common";
import {boolean, pgTable, varchar} from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  ...baseDrizzleTable,
  password: varchar("password", {length: 255}).notNull(),
  email: varchar("email", {length: 13}).notNull().unique(),
  username: varchar("username", {length: 255}).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  displayName: varchar("display_name", {length: 60}).notNull(),
});

export type User = typeof user.$inferSelect;
