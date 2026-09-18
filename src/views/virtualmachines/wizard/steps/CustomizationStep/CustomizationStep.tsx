import type { FC } from 'react';
import React, { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import CustomizeVirtualMachine from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/CustomizeVirtualMachine';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

import useGenerateVM from '../InstanceTypesSteps/hooks/useGenerateVM/useGenerateVM';
import { getAdminLabelsToMerge } from '../InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';

const CustomizationStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, getValues, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const { adminLabels, generatedVM, loaded, userDefaults } = useGenerateVM();

  const hasSeededCustomizedVMRef = useRef(false);

  useEffect(() => {
    if (!loaded || !generatedVM || hasSeededCustomizedVMRef.current) {
      return;
    }

    if (creationMethod !== VMCreationMethod.INSTANCE_TYPE) {
      patchWizardCustomizedVM(getValues, setValue, [
        {
          data: getAdminLabelsToMerge(adminLabels, userDefaults, getValues),
          path: ['metadata', 'labels'],
        },
      ]);
      hasSeededCustomizedVMRef.current = true;
      return;
    }

    setValue(CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM, generatedVM);
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.AUTO_LABELS_MERGED, true);
    hasSeededCustomizedVMRef.current = true;
  }, [adminLabels, creationMethod, generatedVM, getValues, loaded, setValue, userDefaults]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Customization')}
        </Title>
      </StackItem>
      <StackItem>
        {t('Optionally, explore the tabs to further edit your VirtualMachine.')}
      </StackItem>
      <StackItem>
        <CustomizeVirtualMachine />
      </StackItem>
    </Stack>
  );
};

export default CustomizationStep;
