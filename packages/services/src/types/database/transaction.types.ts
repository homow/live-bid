import {PgTransaction} from "drizzle-orm/pg-core";
import {ExtractTablesWithRelations} from "drizzle-orm";
import {NodePgQueryResultHKT} from "drizzle-orm/node-postgres";

type DrizzleTransactionType = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, unknown>,
  ExtractTablesWithRelations<Record<string, unknown>>>;

export type DrizzleTransaction = DrizzleTransactionType;
