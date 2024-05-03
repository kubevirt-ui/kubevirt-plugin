import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
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

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    Promise.resolve(updateCustomizeInstanceType([{ data: updatedVM }]));

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h2">
        <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
      </Title>
      <DescriptionList className="pf-c-description-list">
        <InitialRunTabCloudinit canUpdateVM onSubmit={onSubmit} vm={vm} />
        <Divider />
        <InitialRunTabSysprep canUpdateVM vm={vm} />
      </DescriptionList>
    </PageSection>
  );
};

export default CustomizeInstanceTypeInitialRunTab;
