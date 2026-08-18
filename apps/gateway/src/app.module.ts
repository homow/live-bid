import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {GraphQLModule} from "@nestjs/graphql";
import {graphqlConfigs} from "@app/gateway/lib";
import {ApolloDriverConfig} from "@nestjs/apollo";
import {AppGraphQLModule} from "@app/gateway/graphql/graphql.module";

@Module({
  imports: [
    // Config Service
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/gateway/.env",
    }),

    // GraphQL Configs
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfigs),

    // App GraphQL Module
    AppGraphQLModule,
  ],
})
export class AppModule {}
