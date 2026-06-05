// eslint-disable-next-line import-x/no-extraneous-dependencies -- react-dom is provided transitively via the host component's React 17 runtime; we only need the unmount helper here.
import { unmountComponentAtNode } from 'react-dom';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import LogoutUpsellModal from '../components/LogoutUpsellModal';
import PasskeyUpsellContent, {
  PasskeyUpsellTranslations
} from '../components/PasskeyUpsellContent';

/**
 * Imperative entry point for the passkey logout upsell. Dispatchers in
 * `logoutUpsellService` invoke this without needing to know how the modal is
 * mounted; the React tree owns its own DOM lifecycle (container creation +
 * unmount on close, successful registration, or "sign out anyway").
 *
 * Lifecycle:
 *   - "Sign out anyway" → unmount, then call `onLogout` (page reloads).
 *   - Successful passkey registration → unmount only (user stays signed in).
 *   - Close affordance / Escape → unmount only (user cancelled).
 *   - "Add email" (when offered) → invoke `onAddEmail`; the caller is
 *     responsible for any further UI (a follow-up PR will wire this up).
 */

const CONTAINER_ID = 'logout-upsell-container';

export type ShowPasskeyUpsellModalOptions = {
  translations: PasskeyUpsellTranslations;
  /**
   * When `true`, opt into the passkey + email variant: render the secondary
   * "Add email" CTA and call `onAddEmail` on click. Caller must also provide
   * `translations.addEmailLabel` and `onAddEmail`.
   */
  showAddEmail: boolean;
  onLogout: () => void;
  /** Required when `showAddEmail` is `true`; ignored otherwise. */
  onAddEmail?: () => void;
};

export const showPasskeyUpsellModal = ({
  translations,
  showAddEmail,
  onLogout,
  onAddEmail
}: ShowPasskeyUpsellModalOptions): void => {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
  }

  const cleanup = () => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
    }
  };

  renderWithErrorBoundary(
    <LogoutUpsellModal closeLabel={translations.closeLabel} onClose={cleanup}>
      <PasskeyUpsellContent
        translations={translations}
        showAddEmail={showAddEmail}
        onSignOut={() => {
          cleanup();
          onLogout();
        }}
        onPasskeyRegistered={cleanup}
        onAddEmail={onAddEmail}
      />
    </LogoutUpsellModal>,
    container
  );
};
