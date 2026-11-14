/**
 * Parameters for looking up a single user.
 *
 * @remarks
 * - At least one of `id`, `email`, or `username` must be provided.
 *   The lookup priority is `id` → `email` → `username`.
 * - The `lock` flag is intended for use **inside a transaction** only.
 *   When set to `true`, the matching row is locked using a
 *   `SELECT ... FOR UPDATE` clause, preventing other concurrent
 *   transactions from updating or deleting it until the current
 *   transaction commits or rolls back.
 * - Using `lock: true` outside a transaction is ineffective and
 *   may cause unexpected blocking behavior.
 */
export interface FindOneUserParams {
  id?: string;
  email?: string;
  username?: string;
  /**
   * Acquires a row-level lock (`FOR UPDATE`) on the matched user.
   *
   * @default false
   */
  lock?: boolean;
}
