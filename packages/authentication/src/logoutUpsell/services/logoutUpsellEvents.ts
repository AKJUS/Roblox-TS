import { eventStreamService } from 'core-roblox-utilities';

/**
 * Telemetry for the logout-upsell flow.
 *
 * Keep the `state` values stable: they show up as enum-like values on
 * dashboards and changing them silently breaks alerting.
 */

const AUTH_CLIENT_ERROR = 'authClientError';
const LOGOUT_UPSELL_CONTEXT = 'logoutUpsell';

export const LogoutUpsellClientError = {
  /** Caller tried to open the new prompts-service-gated modal entrypoint, but
   *  the legacy bundle in this page session didn't expose it. Almost always
   *  a rolling-deploy / cached-bundle skew. */
  LegacyModalEntrypointMissing: 'legacyModalEntrypointMissing',
  /** The new entrypoint threw or rejected before dispatching the modal event
   *  (e.g. `getSettingsUIPolicy()` blew up). We failed open to a direct
   *  logout, so the user did not get the upsell. */
  LegacyModalOpenFailed: 'legacyModalOpenFailed'
} as const;

export type LogoutUpsellClientErrorState =
  (typeof LogoutUpsellClientError)[keyof typeof LogoutUpsellClientError];

export const sendLogoutUpsellClientError = (state: LogoutUpsellClientErrorState): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- untyped legacy module
    eventStreamService.sendEventWithTarget(AUTH_CLIENT_ERROR, LOGOUT_UPSELL_CONTEXT, { state });
  } catch {
    // todo: figure out how to send an event to track eventstream errors (joking)
  }
};
