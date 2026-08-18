/** API Responses without data */
export interface BaseApiResponse {
  message: string;
}

/** API Responses with data */
export interface BaseApiResponseData<T> extends BaseApiResponse {
  data: T;
}

/** Base API Responses */
export type ApiResponse<T = void> = T extends void ? BaseApiResponse : BaseApiResponseData<T>;
