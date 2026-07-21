import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, Stack, StackItem, Title } from '@patternfly/react-core';

import SelectionCards from './components/SelectionCards/SelectionCards';
import VirtualizationBundleView from './components/VirtualizationBundleView/VirtualizationBundleView';
import { CapabilitiesDataProvider } from './context/CapabilitiesDataProvider';
import { CapabilitiesView } from './utils/types';

const RecommendedCapabilitiesTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const [selectedView, setSelectedView] = useState<CapabilitiesView>(CapabilitiesView.Bundle);

  return (
    <CapabilitiesDataProvider>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h5">{t('Install virtualization capabilities')}</Title>
        </StackItem>
        <StackItem className="pf-v6-u-pt-md">
          <SelectionCards onSelectView={setSelectedView} selectedView={selectedView} />
        </StackItem>
        <StackItem className="pf-v6-u-mt-lg">
          <Divider className="settings-tab__section-divider" />
        </StackItem>
        <StackItem>
          {selectedView === CapabilitiesView.Bundle ? <VirtualizationBundleView /> : null}
        </StackItem>
      </Stack>
    </CapabilitiesDataProvider>
  );
};

export default RecommendedCapabilitiesTab;
