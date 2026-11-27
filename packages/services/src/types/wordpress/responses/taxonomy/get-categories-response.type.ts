import type { CategoryWP } from "../../taxonomy";
import type { GraphQLResponseWP } from "../graphql-response.type";

export type GetCategoriesResponseWP = GraphQLResponseWP<{
  categories: {
    nodes: CategoryWP[];
  };
}>;
