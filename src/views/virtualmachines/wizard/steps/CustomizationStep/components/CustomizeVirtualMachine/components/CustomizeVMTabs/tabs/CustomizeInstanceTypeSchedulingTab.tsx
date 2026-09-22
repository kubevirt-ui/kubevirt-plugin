import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { PageSection } from '@patternfly/react-core';
import SchedulingSection from '@virtualmachines/details/tabs/configuration/scheduling/components/SchedulingSection';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import useUpdateCustomizeInstanceTypeTab from '../hooks/useUpdateCustomizeInstanceTypeTab';

const CustomizeInstanceTypeSchedulingTab: FC = () => {
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const { updateVMFromForm } = useUpdateCustomizeInstanceTypeTab();

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
