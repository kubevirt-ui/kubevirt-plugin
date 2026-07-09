import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { useRunStrategyToggle } from '@kubevirt-utils/components/RunStrategyModal/useRunStrategyToggle';
import {
  getStartAfterCreationLabel,
  START_AFTER_CREATION_CHECKBOX_ID,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { Checkbox, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import ReviewGrid from '@virtualmachines/wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const isCloneMethod = isCloneCreationMethod(creationMethod);

  useSignals();
  const { isStartChecked, onToggle } = useRunStrategyToggle(
    customizeWizardVMSignal.value ?? undefined,
  );
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Review and create')}
        </Title>
      </StackItem>
      <StackItem>
        {isCloneMethod
          ? t(
              'Before you clone your VirtualMachine, review its configuration. You can create your own unique VM name, or we can generate a name for you.',
            )
          : t('Before you create your VirtualMachine, review its configuration.')}
      </StackItem>
      <StackItem>
        <ReviewGrid />
      </StackItem>
      <StackItem isFilled />
      <StackItem>
        <Checkbox
          onChange={(_, checked: boolean) => {
            const { newStrategy } = onToggle(checked);
            patchCustomizeWizardVMSignal([{ data: newStrategy, path: 'spec.runStrategy' }]);
          }}
          id={START_AFTER_CREATION_CHECKBOX_ID}
          isChecked={isStartChecked}
          label={getStartAfterCreationLabel(t)}
        />
      </StackItem>
    </Stack>
  );
};

export default ReviewAndCreateStep;
