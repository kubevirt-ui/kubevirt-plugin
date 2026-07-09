import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  customizeWizardVMSignal,
  updateVMCustomizeIT,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { PageSection } from '@patternfly/react-core';
import SchedulingSection from '@virtualmachines/details/tabs/configuration/scheduling/components/SchedulingSection';

const CustomizeInstanceTypeSchedulingTab = () => {
  const vm = customizeWizardVMSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <SchedulingSection onSubmit={updateVMCustomizeIT} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeSchedulingTab;
