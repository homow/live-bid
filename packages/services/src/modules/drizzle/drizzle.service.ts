import {db, pool} from "../../database";
import {Injectable, OnModuleInit, Logger, OnModuleDestroy} from "@nestjs/common";

export const DRIZZLE_SCHEMAS = Symbol("DRIZZLE_SCHEMAS");
export type DrizzleServiceSchemas = Record<string, unknown>;

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(DrizzleService.name);

  onModuleInit() {
    this.logger.log("Initializing postgresQL with Drizzle...");
  }

  get db() {
    return db;
  }

  async onModuleDestroy() {
    this.logger.debug("Closing Connection whit PostgresQL and Drizzle...");
    await pool.end();
    this.logger.log("Connection closed.");
  }
}
