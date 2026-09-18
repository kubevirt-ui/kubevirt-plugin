import React, { type FC, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  type PatchCustomizeWizardVMSignal,
  type PatchCustomizeWizardVMSignalArgs,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';
import InitialRunTabCloudinit from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabCloudinit';
import InitialRunTabSysprep from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabSysprep';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

const CustomizeInstanceTypeInitialRunTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { getValues, setValue } = useVMWizard();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const patchInitialRunSpec: PatchCustomizeWizardVMSignal = useCallback(
    (patches: PatchCustomizeWizardVMSignalArgs) =>
      patchWizardCustomizedVM(getValues, setValue, patches),
    [getValues, setValue],
  );

  const updateVMFromForm = useCallback(
    (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine | undefined> =>
      Promise.resolve(patchInitialRunSpec([{ data: updatedVM }])),
    [patchInitialRunSpec],
  );

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
      </Title>
      <DescriptionList>
        <InitialRunTabCloudinit canUpdateVM onSubmit={updateVMFromForm} vm={vm} />
        <Divider />
        <InitialRunTabSysprep canUpdateVM onSubmit={patchInitialRunSpec} vm={vm} />
      </DescriptionList>
    </PageSection>
  );
};

export default CustomizeInstanceTypeInitialRunTab;
