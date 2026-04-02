import type { BrowserOptions } from "@sentry/browser";

type TracesCtx = Parameters<NonNullable<BrowserOptions["tracesSampler"]>>[0];

const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[a-z]{2})\//i;
const HOME_RE = /^\/home\/?$/i;
const PROFILE_RE = /^\/users\/[^/]+\/profile/i;
const FRIENDS_RE = /^\/users\/[^/]+\/friends/i;
const COMMUNITIES_RE = /^\/communities\/[^/]+\/[^/]+/i;
const MOBILE_APP_UPGRADES_RE = /^\/mobile-app-upgrades\/.*/i;
const UPGRADES_RE = /^\/upgrades\/.*/i;
const LOGIN_REDIRECT_RE = /^\/login-redirect(?:\/[^?]*)?(?:\?.*)?$/i;
const DOWNLOAD_LANDING_RE = /^\/(?:[^/]+\/)?download$/i; // matches /download and /[any locale]/download

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// TODO: adjust rates as needed more details here: https://roblox.atlassian.net/wiki/spaces/UB/pages/3909976268/Sentry+Spans+Noise+Reduction
export function buildTracesSampler(perfBase: number) {
  const base = clamp01(perfBase);

  return function tracesSampler(ctx: TracesCtx): number {
    // Respect incoming distributed tracing decision
    if (ctx.parentSampled !== undefined) return ctx.parentSampled ? 1 : 0;

    // Noise-only cuts; everything else stays at base
    const raw = (
      ctx.name ||
      (typeof window !== "undefined" ? window.location.pathname : "") ||
      ""
    ).toLowerCase();
    const path = raw.replace(LOCALE_PREFIX_RE, "/");
    let traceSampleRate;
    if (HOME_RE.test(path)) traceSampleRate = clamp01(base * 0.1); // 90% cut
    if (PROFILE_RE.test(path)) traceSampleRate = clamp01(base * 0.2); // 80% cut
    if (FRIENDS_RE.test(path)) traceSampleRate = clamp01(base * 0.2); // 80% cut
    if (COMMUNITIES_RE.test(path)) traceSampleRate = clamp01(base * 0.2); // 80% cut
    if (MOBILE_APP_UPGRADES_RE.test(path)) traceSampleRate = 0.005; // 10x current
    if (UPGRADES_RE.test(path)) traceSampleRate = 0.005; // 10x current
    if (LOGIN_REDIRECT_RE.test(path)) traceSampleRate = 1; // 100%
    if (DOWNLOAD_LANDING_RE.test(path)) traceSampleRate = 1; // 100%
    return traceSampleRate ?? base;
  };
}
