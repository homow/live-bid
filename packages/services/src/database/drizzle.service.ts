import {Pool} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import {Injectable, OnModuleInit, Logger, OnModuleDestroy, Inject, InternalServerErrorException} from "@nestjs/common";

export const DRIZZLE_SCHEMAS = Symbol("DRIZZLE_SCHEMAS");
export type DrizzleServiceSchemas = Record<string, unknown>;

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public _db: ReturnType<typeof drizzle> | null = null;
  private client: Pool | null = null;
  private readonly logger: Logger = new Logger(DrizzleService.name);

  constructor(
    @Inject(DRIZZLE_SCHEMAS) private schemas: Record<string, unknown> = {}
  ) {}

  onModuleInit() {
    this.logger.log("Initializing postgresQL with Drizzle...");
  }

  private getDb() {
    if (!this._db) {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) throw new InternalServerErrorException("DATABASE_URL must be provided!");

      this.client = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 20_000,
        connectionTimeoutMillis: 10_000,
      });

      this._db = drizzle(this.client, {schema: this.schemas});
      this.logger.log("PostgresQL initialized Successfully with Drizzle");
    }

    return this._db;
  }

  get db() {
    return this.getDb();
  }

  async onModuleDestroy() {
    if (this.client) {
      this.logger.debug("Closing Connection whit PostgresQL and Drizzle...");

      await this.client.end();

      this.logger.log("Connection closed.");
    }
  }
}
