/**
 * Defines pagination and sorting options for collection queries.
 *
 * ### Properties
 *
 * - `page` - Page number (1-based).
 * - `limit` - Maximum number of records per page.
 * - `sort` - Sorting direction.
 * - `orderBy` - Field used to sort the results.
 *
 * @example
 * ```ts
 * const options: PaginationOptions = {
 *   page: 1,
 *   limit: 20,
 *   sort: 'desc',
 *   orderBy: 'created_at',
 * };
 * ```
 */
export interface PaginationOptions {
  /** Page number (1-based). */
  page?: number;

  /** Maximum number of records per page. */
  limit?: number;

  /** Sorting direction. */
  sort?: 'asc' | 'desc';

  /** Field used to sort the results. */
  orderBy?: 'created_at' | 'updated_at';
}
