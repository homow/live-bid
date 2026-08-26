import {GraphQLError} from "graphql";
import {Plugin} from "@nestjs/apollo";
import {GraphQLSchemaHost} from "@nestjs/graphql";
import {getComplexity, simpleEstimator,} from "graphql-query-complexity";
import {ApolloServerPlugin, BaseContext, GraphQLRequestListener,} from "@apollo/server";

@Plugin()
export class ComplexityCustom implements ApolloServerPlugin {
  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async requestDidStart(): Promise<
    GraphQLRequestListener<BaseContext>
  > {
    const maxComplexity = 20;
    const {schema} = this.gqlSchemaHost;

    return {
      // eslint-disable-next-line @typescript-eslint/require-await
      async didResolveOperation({request, document}) {
        /*
         * GraphQL clients/IDEs send IntrospectionQuery automatically
         * to discover the GraphQL schema.
         *
         * Introspection queries are intentionally large and would
         * otherwise exceed a normal application complexity limit.
         */
        if (request.operationName === "IntrospectionQuery") {
          return;
        }

        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,

          estimators: [
            simpleEstimator({
              defaultComplexity: 1,
            }),
          ],
        });

        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
            {
              extensions: {
                code: "BAD_REQUEST",
              },
            },
          );
        }
      },
    };
  }
}
