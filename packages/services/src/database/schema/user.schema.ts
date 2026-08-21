import {UserRoleEnum} from "../../lib";
import {baseDrizzleTable} from "./common";
import {boolean, index, pgEnum, pgTable, varchar} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('user_role', UserRoleEnum);

export const user = pgTable("users", {
  ...baseDrizzleTable,
  password: varchar("password", {length: 255}).notNull(),
  email: varchar("email").notNull().unique(),
  username: varchar("username", {length: 255}).unique(),
  is_active: boolean("is_active").default(true).notNull(),
  display_name: varchar("display_name", {length: 60}).notNull(),
  role: userRoleEnum('role').notNull().default(UserRoleEnum.USER),
}, (table) => ({
  activeRoleIdx: index().on(table.is_active, table.role)
}));

export type User = typeof user.$inferSelect;
