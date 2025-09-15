/**
 * Constants for event stream events in navigation webapp.
 */
const EVENT_CONSTANTS = {
  schematizedEventTypes: {
    authButtonClick: 'authButtonClick',
    authPageLoad: 'authPageLoad',
    authClientError: 'authClientError'
  },
  context: {
    homepage: 'homepage',
    accountSwitcherStatus: 'accountSwitcherStatus',
    cachedUserChanged: 'cachedUserChanged'
  },
  btn: {
    logout: 'logout',
    switchAccount: 'switchAccount'
  }
} as const;

export default EVENT_CONSTANTS;
