import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { updateVMCustomizeIT, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import SchedulingSection from '@virtualmachines/details/tabs/configuration/scheduling/components/SchedulingSection';

const CustomizeInstanceTypeSchedulingTab = () => {
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection variant={PageSectionVariants.light}>
      <SchedulingSection onSubmit={updateVMCustomizeIT} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeSchedulingTab;
