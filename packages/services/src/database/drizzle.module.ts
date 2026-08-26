import {DynamicModule, Global, Module} from "@nestjs/common";
import {DRIZZLE_SCHEMAS, DrizzleService, DrizzleServiceSchemas} from "./drizzle.service";

@Global()
@Module({})
export class DrizzleModule {
  // noinspection JSUnusedGlobalSymbols
  static forRoot(schemas: DrizzleServiceSchemas): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DRIZZLE_SCHEMAS,
          useValue: schemas
        },
        DrizzleService,
      ],
      exports: [DrizzleService]
    };
  }
}
