import {UserRoleEnum} from "../../lib";
import {baseDrizzleTable} from "./common";
import {boolean, pgEnum, pgTable, varchar} from "drizzle-orm/pg-core";

const userRoleEnum = pgEnum('user_role', UserRoleEnum);

export const user = pgTable("users", {
  ...baseDrizzleTable,
  password: varchar("password", {length: 255}).notNull(),
  email: varchar("email", {length: 13}).notNull().unique(),
  username: varchar("username", {length: 255}).unique(),
  is_active: boolean("is_active").default(true).notNull(),
  display_name: varchar("display_name", {length: 60}).notNull(),
  role: userRoleEnum('role').notNull().default(UserRoleEnum.USER),
});

export type User = typeof user.$inferSelect;
