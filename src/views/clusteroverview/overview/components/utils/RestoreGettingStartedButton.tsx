import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import useGettingStartedShowState from '../OverviewTab/getting-started-card/utils/hooks/useGettingStartedShowState';

import { GETTING_STARTED_SHOW_STATE } from './constants';

interface RestoreGettingStartedButtonProps {
  userSettingsKey: string;
}

const RestoreGettingStartedButton: React.FC<RestoreGettingStartedButtonProps> = ({
  userSettingsKey,
}) => {
  const { t } = useKubevirtTranslation();
  const [showState, setShowState, showStateLoaded] = useGettingStartedShowState(userSettingsKey);

  if (!showStateLoaded || showState !== GETTING_STARTED_SHOW_STATE.HIDE) {
    return null;
  }

  return (
    <Label
      color="purple"
      onClick={() => {
        setShowState(GETTING_STARTED_SHOW_STATE.SHOW);
      }}
      onClose={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowState(GETTING_STARTED_SHOW_STATE.DISAPPEAR);
      }}
      style={{ cursor: 'pointer' }}
      data-test="restore-getting-started"
    >
      {t('Show getting started resources')}
    </Label>
  );
};

export default RestoreGettingStartedButton;
