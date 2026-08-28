import type {NormalizeClientInfoType} from "@live-bid/services/types";

export function normalizeClientInfo(input: Express.Request["clientInfo"]): NormalizeClientInfoType {
  const {ip, ua, geo, lang} = input;

  return {
    ip,
    browser: ua.browser?.name ?? null,
    os: ua.os?.name ?? null,
    device: ua.device?.type ?? "desktop",
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    lang,
  };
}
