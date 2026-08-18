import {Module} from "@nestjs/common";
import * as Resolvers from "./resolvers";

@Module({
  providers: [
    Resolvers.AuthResolver
  ]
})
export class GraphQLModule {}
