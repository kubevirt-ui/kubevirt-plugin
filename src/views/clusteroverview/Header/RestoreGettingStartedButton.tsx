import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';

import useGettingStartedShowState from '../OverviewTab/getting-started-card/utils/hooks/useGettingStartedShowState';
import {
  GETTING_STARTED_SHOW_STATE,
  KUBEVIRT_QUICK_START_USER_SETTINGS_KEY,
} from '../utils/constants';

const RestoreGettingStartedButton: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [showState, setShowState, showStateLoaded] = useGettingStartedShowState(
    KUBEVIRT_QUICK_START_USER_SETTINGS_KEY,
  );

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
