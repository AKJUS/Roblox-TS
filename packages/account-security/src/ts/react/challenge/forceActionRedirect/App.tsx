import React from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { ForceActionRedirect as ForceActionRedirectTypes } from '@rbx/generic-challenge-types';
import ForceActionRedirect from './containers/forceActionRedirect';
import { ForceActionRedirectContextProvider } from './store/contextProvider';

type Props = {
  forceActionRedirectChallengeConfig: ForceActionRedirectTypes.ForceActionRedirectChallengeConfig;
  renderInline: boolean;
  onModalChallengeAbandoned: ForceActionRedirectTypes.OnModalChallengeAbandonedCallback | null;
  onChallengeAbandoned: ForceActionRedirectTypes.OnChallengeAbandonedCallback | null;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  renderInline,
  forceActionRedirectChallengeConfig,
  translate,
  onModalChallengeAbandoned,
  onChallengeAbandoned
}: Props) => {
  return (
    <ForceActionRedirectContextProvider
      renderInline={renderInline}
      forceActionRedirectChallengeConfig={forceActionRedirectChallengeConfig}
      translate={translate}
      onChallengeAbandoned={onChallengeAbandoned}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <ForceActionRedirect />
    </ForceActionRedirectContextProvider>
  );
};

export default App;
