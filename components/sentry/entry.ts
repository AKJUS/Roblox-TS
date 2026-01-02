import {
  init as sentryInit,
  setUser as sentrySetUser,
  setTag as setSentryTag,
  browserTracingIntegration,
} from "@sentry/browser";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { buildTracesSampler } from "./src/utils/tracesSampler";
import { filterCdnSpans } from "./src/utils/filterCdnSpans";

const metaTag = document.querySelector<HTMLMetaElement>('meta[name="sentry-meta"]');
const { dsn, envName, sampleRate } = metaTag?.dataset ?? {};

const parsedSampleRate = sampleRate == null ? 0.001 : parseFloat(sampleRate);
const perfBase = Math.min(parsedSampleRate, 0.0005);

sentryInit({
  dsn:
    dsn ?? "https://24df60727c94bd0aa14ab1269d104a21@o293668.ingest.us.sentry.io/4509158985826304",
  integrations: [browserTracingIntegration()],
  environment: envName ?? "staging",
  /// Keep a base perf rate visible (docs/telemetry). If tracesSampler is present,
  // Sentry uses the sampler’s return value; we use this as the "default base".
  tracesSampleRate: perfBase,
  // Cut noise: only trace XHR/fetch calls to our own API and page loads.
  tracesSampler: buildTracesSampler(perfBase),
  sampleRate: parsedSampleRate,
  replaysOnErrorSampleRate: parsedSampleRate,
  beforeSendTransaction: filterCdnSpans,
});

document.addEventListener("DOMContentLoaded", () => {
  // Set more context for Sentry exceptions
  sentrySetUser({
    id: authenticatedUser.id?.toString() ?? "1",
    username: authenticatedUser.name ?? "unknown",
  });

  // Set initial internal-page-name tag from meta tag
  const pageMetaTag = document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');
  if (pageMetaTag?.dataset.internalPageName) {
    setSentryTag("internal-page-name", pageMetaTag.dataset.internalPageName);
  }

  // Watch for changes to the page-meta tag and update the Sentry tag
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-internal-page-name" &&
        mutation.target instanceof HTMLMetaElement
      ) {
        const newValue = mutation.target.dataset.internalPageName;
        if (newValue) {
          setSentryTag("internal-page-name", newValue);
        }
      }
    });
  });

  if (pageMetaTag) {
    observer.observe(pageMetaTag, {
      attributes: true,
      attributeFilter: ["data-internal-page-name"],
    });
  }
});
