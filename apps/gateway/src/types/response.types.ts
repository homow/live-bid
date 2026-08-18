/** params type for get schema for swagger when zod validate not success */
export interface ZodFieldError {
  field: string;
  error: string;
}
