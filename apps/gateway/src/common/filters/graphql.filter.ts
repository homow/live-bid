import {GraphQLError} from "graphql";
import {ArgumentsHost, Catch, ExceptionFilter} from "@nestjs/common";

@Catch(GraphQLError)
export class GraphqlFilter implements ExceptionFilter {
  catch(exception: GraphQLError, _host: ArgumentsHost) {
    return new GraphQLError(exception.message, {
      extensions: exception.extensions
    });
  }
}
