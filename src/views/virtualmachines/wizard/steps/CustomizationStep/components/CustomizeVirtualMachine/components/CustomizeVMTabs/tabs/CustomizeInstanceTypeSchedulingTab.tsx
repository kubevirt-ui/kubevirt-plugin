import React, { type FC, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { PageSection } from '@patternfly/react-core';
import SchedulingSection from '@virtualmachines/details/tabs/configuration/scheduling/components/SchedulingSection';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

const CustomizeInstanceTypeSchedulingTab: FC = () => {
  const { getValues, setValue } = useVMWizard();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const updateVMFromForm = useCallback(
    (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine | undefined> => {
      const replacePatch = [{ data: updatedVM }];

      return Promise.resolve(patchWizardCustomizedVM(getValues, setValue, replacePatch));
    },
    [getValues, setValue],
  );

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <SchedulingSection onSubmit={updateVMFromForm} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeSchedulingTab;
