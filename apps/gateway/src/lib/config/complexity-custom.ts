import {GraphQLError} from "graphql";
import {Plugin} from "@nestjs/apollo";
import {GraphQLSchemaHost} from "@nestjs/graphql";
import {ApolloServerPlugin, BaseContext, GraphQLRequestListener} from "@apollo/server";
import {fieldExtensionsEstimator, getComplexity, simpleEstimator} from "graphql-query-complexity";

@Plugin()
export class ComplexityCustom implements ApolloServerPlugin {
  constructor(private gqpSchemaHost: GraphQLSchemaHost) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const maxComplexity = 20;
    const {schema} = this.gqpSchemaHost;

    return {
      // eslint-disable-next-line @typescript-eslint/require-await
      async didResolveOperation({request, document}) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({defaultComplexity: 1})
          ]
        });

        if (complexity > maxComplexity) {
          throw new GraphQLError(`Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`);
        }
      },
    };
  }
}
