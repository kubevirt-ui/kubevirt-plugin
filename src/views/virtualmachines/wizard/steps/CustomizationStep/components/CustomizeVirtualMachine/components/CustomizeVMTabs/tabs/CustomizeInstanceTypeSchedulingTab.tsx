import { type FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { PageSection } from '@patternfly/react-core';
import SchedulingSection from '@virtualmachines/details/tabs/configuration/scheduling/components/SchedulingSection';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const CustomizeInstanceTypeSchedulingTab: FC = () => {
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) return <Loading />;

  return (
    <PageSection>
      <SchedulingSection
        onSubmit={async (updatedVM) => replaceDraft(updatedVM) ?? updatedVM}
        vm={vm}
      />
    </PageSection>
  );
};

export default CustomizeInstanceTypeSchedulingTab;
