import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { Switch } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const WelcomeSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [quickStarts, setQuickStarts] = useKubevirtUserSettings('quickStart');
  return (
    <ExpandSection toggleText={t('Welcome information')}>
      <Switch
        onChange={(_event, value) =>
          setQuickStarts({ ...quickStarts, dontShowWelcomeModal: !value })
        }
        isChecked={!quickStarts?.dontShowWelcomeModal}
        label={quickStarts?.dontShowWelcomeModal ? t('Hide') : t('Show')}
      />
    </ExpandSection>
  );
};

export default WelcomeSection;
