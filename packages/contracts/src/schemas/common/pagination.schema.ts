import {z} from "zod";
import {BaseOrderByEnum, BaseSortByEnum} from "../../enums";

/**
 * Validates pagination and sorting options for user queries.
 */
export const PaginationSchema = z.object({
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .default(10),

    page: z
      .number()
      .min(1)
      .optional()
      .default(1),

    orderBy: z
      .enum(BaseOrderByEnum)
      .optional()
      .default(BaseOrderByEnum.created_at),

    sortBy: z
      .enum(BaseSortByEnum)
      .optional()
      .default(BaseSortByEnum.desc),
  }
);

export type PaginationSchemaType = z.infer<typeof PaginationSchema>;

export const getPaginationWithOffsetSchema = <T extends z.ZodType<PaginationSchemaType>>(schema: T): z.ZodPipe<T, z.ZodTransform<Awaited<z.core.output<T> & {
  offset: number;
}>, z.core.output<T>>> => {
  return schema.transform((args) => ({
    ...args,
    offset: args.limit * (args.page - 1),
  }));
};
