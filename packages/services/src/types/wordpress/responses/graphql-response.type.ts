export interface GraphQLErrorLocationWP {
  line: number;
  column: number;
}

export interface GraphQLErrorWP {
  message: string;
  locations?: GraphQLErrorLocationWP[];
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface GraphQLResponseWP<TData> {
  data?: TData | null;
  errors?: GraphQLErrorWP[];
  extensions?: Record<string, unknown>;
}
