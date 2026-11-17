import type {PaginationOptions} from "../../../common";
import type {UserRoleEnum} from "@live-bid/contracts/enums";

/**
 * Options for retrieving a filtered and paginated list of users.
 */
export interface FindManyUsersOptions extends PaginationOptions {
  /** Filters users by their assigned role. */
  role?: UserRoleEnum;
}
