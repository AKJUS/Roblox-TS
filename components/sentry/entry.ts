import {
  init as initSentry,
  browserTracingIntegration,
  makeBrowserOfflineTransport,
  makeFetchTransport,
  setUser,
  setTag,
  startSpan,
  getActiveSpan,
  flush,
} from "@sentry/browser";
import environmentUrls from "@rbx/environment-urls";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { buildTracesSampler } from "./src/utils/tracesSampler";
import { filterCdnSpans } from "./src/utils/filterCdnSpans";
import { sendToOtel } from "./src/utils/sentryToOtel";

declare global {
  interface Window {
    Sentry?: {
      startSpan: typeof startSpan;
      getActiveSpan: typeof getActiveSpan;
      flush: typeof flush;
    };
  }
}

// Expose Sentry as a global for non-module consumers.
if (typeof window !== "undefined") {
  window.Sentry = {
    startSpan,
    getActiveSpan,
    flush,
  };
}

const metaTag = document.querySelector<HTMLMetaElement>('meta[name="sentry-meta"]');
const { dsn, envName, sampleRate } = metaTag?.dataset ?? {};
const otelEndpoint =
  environmentUrls.otelCollectorTracesEndpoint ||
  "https://otel-collector-otlp-http-sitetest3.simulpong.com/v1/traces";

const parsedSampleRate = sampleRate == null ? 0.001 : parseFloat(sampleRate);
const perfBase = Math.min(parsedSampleRate, 0.0005);

initSentry({
  dsn:
    dsn ?? "https://24df60727c94bd0aa14ab1269d104a21@o293668.ingest.us.sentry.io/4509158985826304",
  integrations: [
    browserTracingIntegration({
      detectRedirects: true,
    }),
  ],
  environment: envName ?? "staging",
  /// Keep a base perf rate visible (docs/telemetry). If tracesSampler is present,
  tracesSampleRate: perfBase,
  // Cut noise: only trace XHR/fetch calls to our own API and page loads.
  tracesSampler: buildTracesSampler(perfBase),
  sampleRate: parsedSampleRate,
  replaysOnErrorSampleRate: parsedSampleRate,
  beforeSendTransaction: event => {
    // Fire-and-forget, doesn't block
    sendToOtel(otelEndpoint, event);
    return filterCdnSpans(event);
  },
  // Enable offline transport for Sentry to work when the user is offline or when page changes before sentry can send the events
  transport: makeBrowserOfflineTransport(makeFetchTransport),
});

document.addEventListener("DOMContentLoaded", () => {
  // Set more context for Sentry exceptions.
  setUser({
    id: authenticatedUser.id?.toString() ?? "1",
    username: authenticatedUser.name ?? "unknown",
  });

  // Set initial internal-page-name tag from meta tag
  const pageMetaTag = document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');
  if (pageMetaTag?.dataset.internalPageName) {
    setTag("internal-page-name", pageMetaTag.dataset.internalPageName);
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
          setTag("internal-page-name", newValue);
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
