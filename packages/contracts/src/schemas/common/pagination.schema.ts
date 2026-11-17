import {z} from "zod";

export const BASE_SORT_BY_ENUM = ['asc', 'desc'] as const;
export const BASE_ORDER_BY_ENUM = ['created_at', 'updated_at'] as const;

/**
 * Validates pagination and sorting options for user queries.
 */
export const PaginationSchema = z.object({
    limit: z
      .number()
      .min(2)
      .max(100)
      .optional()
      .default(10),

    page: z
      .number()
      .min(1)
      .optional()
      .default(1),

    orderBy: z
      .enum(BASE_ORDER_BY_ENUM)
      .optional()
      .default('created_at'),

    sort: z
      .enum(BASE_SORT_BY_ENUM)
      .optional()
      .default('desc'),
  }
);

export type PaginationSchemaType = z.infer<typeof PaginationSchema>;

export const paginationOffsetSchema = <T extends z.ZodType<PaginationSchemaType>>(schema: T): z.ZodPipe<T, z.ZodTransform<Awaited<z.core.output<T> & {
  offset: number;
}>, z.core.output<T>>> => {
  return schema.transform((args) => ({
    ...args,
    offset: args.limit * (args.page - 1),
  }));
};
