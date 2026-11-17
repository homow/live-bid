import {z} from "zod";

export const BASE_SORT_BY_ENUM = ['asc', 'desc'] as const;
export const BASE_ORDER_BY_ENUM = ['created_at', 'updated_at'] as const;

/**
 * Validates pagination and sorting options for user queries.
 */
export const FindManyUserSchema = z.object({
  limit: z
    .number()
    .min(2)
    .max(100)
    .nullable()
    .default(10),

  page: z
    .number()
    .min(1)
    .nullable()
    .default(1),

  orderBy: z
    .enum(BASE_ORDER_BY_ENUM)
    .nullable()
    .default('created_at'),

  sort: z
    .enum(BASE_SORT_BY_ENUM)
    .nullable()
    .default('desc'),
});

export type FindManyUserSchemaType = z.infer<typeof FindManyUserSchema>;
