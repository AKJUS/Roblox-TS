/**
 * Constants for event stream events in navigation webapp.
 */
const EVENT_CONSTANTS = {
  schematizedEventTypes: {
    authButtonClick: "authButtonClick",
    authPageLoad: "authPageLoad",
    authClientError: "authClientError",
  },
  context: {
    homepage: "homepage",
    accountSwitcherStatus: "accountSwitcherStatus",
    cachedUserChanged: "cachedUserChanged",
    auth401Modal: "signInRedirect",
  },
  btn: {
    logout: "logout",
    switchAccount: "switchAccount",
    signIn: "signIn",
  },
} as const;

export default EVENT_CONSTANTS;
