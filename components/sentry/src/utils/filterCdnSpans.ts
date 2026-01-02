import type { BrowserOptions } from "@sentry/browser";

type BeforeSendTransactionCallback = NonNullable<BrowserOptions["beforeSendTransaction"]>;
export type Transaction = Parameters<BeforeSendTransactionCallback>[0];

const CDN_DOMAINS = [
  "css.rbxcdn.com",
  "static.rbxcdn.com",
  "js.rbxcdn.com",
  "tr.rbxcdn.com",
  "metrics.roblox.com",
  "images.rbxcdn.com",
];

/**
 * Filters out spans from CDN domains to reduce noise in Sentry traces.
 * This function removes network request spans (http.client, resource.*) that
 * target specified CDN domains.
 *
 * @param transaction - The Sentry transaction to filter
 * @returns The transaction with CDN spans filtered out
 */
export function filterCdnSpans(transaction: Transaction): Transaction {
  if (!transaction.spans) {
    return transaction;
  }

  const filteredSpans = transaction.spans.filter(span => {
    // Check if this is a network request span
    if (span.op === "http.client" || span.op?.startsWith("resource.")) {
      const url = span.description ?? span.data.url;
      if (typeof url === "string") {
        // Filter out if the URL matches any of our CDN domains
        return !CDN_DOMAINS.some(domain => url.includes(domain));
      }
    }
    return true;
  });

  return {
    ...transaction,
    spans: filteredSpans,
  };
}
