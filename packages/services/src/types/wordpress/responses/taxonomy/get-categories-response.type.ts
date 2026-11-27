import type { Category } from "../../taxonomy";
import type { GraphQLResponse } from "../graphql-response.type";

export type GetCategoriesResponse = GraphQLResponse<{
  categories: {
    nodes: Category[];
  };
}>;
