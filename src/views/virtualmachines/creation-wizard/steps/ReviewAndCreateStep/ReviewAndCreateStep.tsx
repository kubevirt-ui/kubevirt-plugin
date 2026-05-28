import React, { FC } from 'react';

import { useRunStrategyToggle } from '@kubevirt-utils/components/RunStrategyModal/useRunStrategyToggle';
import {
  getStartAfterCreationLabel,
  START_AFTER_CREATION_CHECKBOX_ID,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Checkbox, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import ReviewGrid from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { creationMethod } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);

  useSignals();
  const { isStartChecked, onToggle } = useRunStrategyToggle(vmSignal.value ?? undefined);
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
            updateCustomizeInstanceType([{ data: newStrategy, path: 'spec.runStrategy' }]);
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
