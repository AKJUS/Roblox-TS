/* eslint-disable import/prefer-default-export */
import { VerificationViewState } from '../enums';
import { PageText } from '../verificationSlice';

const mapsPageStateByViewState = (viewState: VerificationViewState): Partial<PageText> => {
  switch (viewState) {
    case VerificationViewState.FAILURE:
      return {
        heading: 'Heading.VerificationFailed',
        icon: 'failure-icon',
        bodyText: ['Label.FailedVerification'],
        buttonText: 'Action.Close'
      };
    case VerificationViewState.PENDING:
      return {
        heading: 'Heading.VerificationPending',
        icon: 'failure-icon',
        bodyText: ['Label.PendingVerification'],
        buttonText: 'Action.Close'
      };
    case VerificationViewState.ERROR:
      return {
        heading: 'Heading.Error',
        icon: 'failure-icon',
        bodyText: ['Label.GenericError']
      };
    case VerificationViewState.TEMP_BAN:
      return {
        heading: 'Heading.Error',
        icon: 'failure-icon',
        bodyText: ['Label.VerificationDeclined']
      };
    case VerificationViewState.SUCCESS_GENERIC:
    case VerificationViewState.LANDING:
    case VerificationViewState.EMAIL:
    case VerificationViewState.MODAL:
    case VerificationViewState.POLLING:
    case VerificationViewState.EMAIL_CONTINUE:
    case VerificationViewState.EXTERNAL_EMAIL:
    case VerificationViewState.VENDOR_LINK:
    default:
      return {};
  }
};

export const getPageStateConstants = (page: VerificationViewState, bodyTextList: string[] = []) => {
  const defaultPageStateParams: PageText = {
    heading: 'Heading.VerificationSuccessful',
    icon: 'success-icon',
    bodyText: ['Label.DateOfBirthUpdated'],
    buttonText: 'Action.Close',
    footerText: ''
  };

  const overwrittenPageState = mapsPageStateByViewState(page);

  const remappedBodyTextPageState = {
    ...overwrittenPageState,
    bodyText: [...(overwrittenPageState.bodyText || []), ...bodyTextList]
  };

  return {
    ...defaultPageStateParams,
    ...remappedBodyTextPageState
  };
};
