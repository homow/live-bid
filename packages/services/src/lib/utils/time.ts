/** 1 minutes in milliseconds */
export const ONE_SECOND_MS: number = 1000;
export const ONE_MINUTE_MS: number = ONE_SECOND_MS * 60;
export const ONE_HOUR_MS: number = ONE_MINUTE_MS * 60;
export const TWO_HOUR_MS: number = ONE_HOUR_MS * 2;

/** get local now date */
export function getLocalDate(result: "fa-IR" | "en-CA") {
  return new Date().toLocaleDateString(result);
}
