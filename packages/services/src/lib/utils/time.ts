/** 1 minutes in milliseconds */
export const ONE_MINUTE_MS = 60_000 as const;
export const ONE_HOUR_MS: number = ONE_MINUTE_MS * 60;
export const TOW_HOUR_MS: number = ONE_HOUR_MS * 2;

/** get local now date */
export function getLocalDate(result: "fa-IR" | "en-CA") {
  return new Date().toLocaleDateString(result);
}
