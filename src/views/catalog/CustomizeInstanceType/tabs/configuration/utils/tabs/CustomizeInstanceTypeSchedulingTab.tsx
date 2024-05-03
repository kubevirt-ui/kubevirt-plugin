import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import SchedulingSection from '@virtualmachines/details/tabs/configuration/scheduling/components/SchedulingSection';

const CustomizeInstanceTypeSchedulingTab = () => {
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    Promise.resolve(
      updateCustomizeInstanceType([
        {
          data: updatedVM,
        },
      ]),
    );

  return (
    <PageSection variant={PageSectionVariants.light}>
      <SchedulingSection onSubmit={onSubmit} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeSchedulingTab;
