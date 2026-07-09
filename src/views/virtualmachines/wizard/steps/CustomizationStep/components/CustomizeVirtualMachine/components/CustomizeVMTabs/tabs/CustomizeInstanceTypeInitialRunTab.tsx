import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
  updateVMCustomizeIT,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';
import InitialRunTabCloudinit from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabCloudinit';
import InitialRunTabSysprep from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabSysprep';

const CustomizeInstanceTypeInitialRunTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = customizeWizardVMSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
      </Title>
      <DescriptionList>
        <InitialRunTabCloudinit canUpdateVM onSubmit={updateVMCustomizeIT} vm={vm} />
        <Divider />
        <InitialRunTabSysprep canUpdateVM onSubmit={patchCustomizeWizardVMSignal} vm={vm} />
      </DescriptionList>
    </PageSection>
  );
};

export default CustomizeInstanceTypeInitialRunTab;
