import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  updateCustomizeInstanceType,
  updateVMCustomizeIT,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import {
  DescriptionList,
  Divider,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import InitialRunTabCloudinit from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabCloudinit';
import InitialRunTabSysprep from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabSysprep';

const CustomizeInstanceTypeInitialRunTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h2">
        <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
      </Title>
      <DescriptionList className="pf-c-description-list">
        <InitialRunTabCloudinit canUpdateVM onSubmit={updateVMCustomizeIT} vm={vm} />
        <Divider />
        <InitialRunTabSysprep canUpdateVM onSubmit={updateCustomizeInstanceType} vm={vm} />
      </DescriptionList>
    </PageSection>
  );
};

export default CustomizeInstanceTypeInitialRunTab;
