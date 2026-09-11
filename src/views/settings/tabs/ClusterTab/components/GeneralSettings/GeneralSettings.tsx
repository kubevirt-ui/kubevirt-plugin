import { createElement, type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsSections, type HyperConvergeConfigurationWatch } from './consts/consts';

type GeneralSettingsProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
  newBadge?: boolean;
};

const GeneralSettings: FC<GeneralSettingsProps> = ({ hyperConvergeConfiguration, newBadge }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      dataTestID="general-settings"
      searchItemId={CLUSTER_TAB_IDS.generalSettings}
      toggleText={t('General settings')}
    >
      <Stack hasGutter>
        {getGeneralSettingsSections(t).map(({ Component: sectionComponent, label }) => (
          <StackItem isFilled key={label}>
            {createElement(sectionComponent, { hyperConvergeConfiguration, newBadge })}
          </StackItem>
        ))}
      </Stack>
    </ExpandSection>
  );
};
export default GeneralSettings;
