import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsSections } from './consts/consts';

type GeneralSettingsProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge?: boolean;
};

const GeneralSettings: FC<GeneralSettingsProps> = ({ hyperConvergeConfiguration, newBadge }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.generalSettings}
      toggleText={t('General settings')}
    >
      <Stack hasGutter>
        {getGeneralSettingsSections(t).map(({ Component, label }) => (
          <StackItem key={label} isFilled>
            <Component
              hyperConvergeConfiguration={hyperConvergeConfiguration}
              newBadge={newBadge}
            />
          </StackItem>
        ))}
      </Stack>
    </ExpandSection>
  );
};
export default GeneralSettings;
