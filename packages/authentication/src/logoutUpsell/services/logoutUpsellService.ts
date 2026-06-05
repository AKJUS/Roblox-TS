// @ts-expect-error - Legacy Roblox module types
import { EmailVerificationService } from '@rbx/core-scripts/legacy/Roblox';
import ExperimentationService from '@rbx/experimentation';
import { PasskeyUpsellTranslations } from '../components/PasskeyUpsellContent';
import {
  getLogoutPrompt,
  LogoutPrompt,
  recordLogoutPromptImpression
} from './logoutPromptApi';
import {
  LogoutUpsellClientError,
  sendLogoutUpsellClientError
} from './logoutUpsellEvents';
import { showPasskeyUpsellModal } from './showPasskeyUpsellModal';

/**
 * Single entry point for the logout upsell flow.
 *
 * Behavior:
 *   1. Read the prompts-service flag from IXP (`Website.LogoutUpsell` /
 *      `IsPromptsServiceEnabled`). If it's disabled in IXP, or IXP errors out
 *      or is unreachable, fall back to the legacy email upsell handler — it
 *      runs the legacy `IsEmailUpsellAtLogoutEnabled` + email-status checks
 *      and that preserves today's logout behavior.
 *   2. When prompts service is enabled, ask the modals service for an eligible
 *      logout prompt and dispatch on `promptType`:
 *        - `LogoutEmailUpsellV1` → record an impression and open the legacy
 *          email upsell modal directly via `openLogoutEmailUpsellModal`. The
 *          prompts service has already decided this user should see the
 *          modal, so we skip the legacy eligibility checks (metadata flag +
 *          email-status GET) and just render.
 *        - `LogoutPasskeyUpsellV1` / `LogoutPasskeyUpsellWithEmailV1` →
 *          record an impression, build a `PasskeyUpsellTranslations` from
 *          `prompt.translations` (with English fallbacks for any keys the
 *          server hasn't filled in yet), and mount the passkey upsell modal.
 *          The "with email" variant additionally surfaces an "Add email" CTA;
 *          its click handler is a no-op until the email flow lands in a
 *          follow-up PR.
 *        - Anything else (including no prompt) → log out directly. Renderers
 *          for new prompt types land in follow-up PRs that add branches to
 *          `dispatchPrompt`.
 */

const LOGOUT_UPSELL_LAYER = 'Website.LogoutUpsell';

// From modals-eligibility-service config
const PROMPT_TYPE_LOGOUT_EMAIL_UPSELL_V1 = 'LogoutEmailUpsellV1';
const PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_V1 = 'LogoutPasskeyUpsellV1';
const PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_WITH_EMAIL_V1 = 'LogoutPasskeyUpsellWithEmailV1';

export type HandleLogoutUpsellOptions = {
  /** Called when the upsell flow is finished and the page should log out. */
  onLogout: () => void;
};

const isPromptsServiceEnabled = async (): Promise<boolean> => {
  try {
    const ixp = await ExperimentationService.getAllValuesForLayer(LOGOUT_UPSELL_LAYER);
    return ixp?.IsPromptsServiceEnabled === true;
  } catch {
    return false;
  }
};

// This includes the legacy email service & authAPI checks that get skipped if
// prompts service is enabled
const runLegacyEmailUpsell = (onLogout: () => void): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises -- untyped legacy module
  EmailVerificationService?.handleUserEmailUpsellAtLogout(onLogout).then(
    (data: { emailAddress?: string } | null | undefined) => {
      if (!data || data.emailAddress) {
        onLogout();
      }
    }
  );
};

// Skips email service & authAPI checks (done by prompts service)
const openLegacyEmailUpsellModal = (onLogout: () => void): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- untyped legacy module
  const openModal = EmailVerificationService?.openLogoutEmailUpsellModal as
    | ((skipCallback: () => void) => Promise<void> | void)
    | undefined;
  if (typeof openModal !== 'function') {
    // if new method is missing due to cached bundle, fall back to legacy path
    sendLogoutUpsellClientError(LogoutUpsellClientError.LegacyModalEntrypointMissing);
    runLegacyEmailUpsell(onLogout);
    return;
  }
  const failOpen = () => {
    sendLogoutUpsellClientError(LogoutUpsellClientError.LegacyModalOpenFailed);
    onLogout();
  };
  try {
    Promise.resolve(openModal(onLogout)).catch(failOpen);
  } catch {
    failOpen();
  }
};

const PASSKEY_UPSELL_FALLBACKS = {
  title: 'Stay signed in easily next time',
  body: 'Add a passkey for faster, more secure sign in with Face ID, fingerprint, or your device PIN.',
  bodyWithEmail:
    'Add a passkey for faster, more secure sign in with Face ID, fingerprint, or your device PIN. Or add an email as a backup.',
  addPasskeyLabel: 'Add passkey',
  addEmailLabel: 'Add email',
  signOutLabel: 'Sign out anyway',
  closeLabel: 'Close'
};

const buildPasskeyTranslations = (
  promptTranslations: Record<string, string>,
  { withEmail }: { withEmail: boolean }
): PasskeyUpsellTranslations => {
  const pick = (key: string, fallback: string): string => promptTranslations[key] ?? fallback;
  const base: PasskeyUpsellTranslations = {
    title: pick('title', PASSKEY_UPSELL_FALLBACKS.title),
    body: pick(
      'body',
      withEmail ? PASSKEY_UPSELL_FALLBACKS.bodyWithEmail : PASSKEY_UPSELL_FALLBACKS.body
    ),
    addPasskeyLabel: pick('primaryButton', PASSKEY_UPSELL_FALLBACKS.addPasskeyLabel),
    signOutLabel: pick('tertiaryButton', PASSKEY_UPSELL_FALLBACKS.signOutLabel),
    closeLabel: pick('closeLabel', PASSKEY_UPSELL_FALLBACKS.closeLabel)
  };
  if (withEmail) {
    base.addEmailLabel = pick('secondaryButton', PASSKEY_UPSELL_FALLBACKS.addEmailLabel);
  }
  return base;
};

const dispatchPasskeyUpsell = (
  prompt: LogoutPrompt,
  onLogout: () => void,
  withEmail: boolean
): void => {
  recordLogoutPromptImpression(prompt.promptType);
  showPasskeyUpsellModal({
    translations: buildPasskeyTranslations(prompt.translations, { withEmail }),
    showAddEmail: withEmail,
    onLogout,
    // TODO: (AA-6920) wire the "Add email" CTA to the email-add flow. The
    // button is rendered when the prompts service tells us to (variant =
    // WithEmail), but the click is a no-op until the follow-up PR lands.
    onAddEmail: withEmail ? () => undefined : undefined
  });
};

const dispatchPrompt = (prompt: LogoutPrompt, onLogout: () => void): void => {
  switch (prompt.promptType) {
    case PROMPT_TYPE_LOGOUT_EMAIL_UPSELL_V1:
      recordLogoutPromptImpression(prompt.promptType);
      openLegacyEmailUpsellModal(onLogout);
      return;
    case PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_V1:
      dispatchPasskeyUpsell(prompt, onLogout, false);
      return;
    case PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_WITH_EMAIL_V1:
      dispatchPasskeyUpsell(prompt, onLogout, true);
      return;
    default:
      onLogout();
  }
};

export const handleLogoutUpsell = async ({ onLogout }: HandleLogoutUpsellOptions): Promise<void> => {
  const enabled = await isPromptsServiceEnabled();
  if (!enabled) {
    runLegacyEmailUpsell(onLogout);
    return;
  }

  const prompt = await getLogoutPrompt();
  if (!prompt) {
    onLogout();
    return;
  }

  dispatchPrompt(prompt, onLogout);
};
