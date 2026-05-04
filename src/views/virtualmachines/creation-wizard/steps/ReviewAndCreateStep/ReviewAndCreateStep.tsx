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
import ReviewGrid from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';

import NameAndDescriptionForm from './components/NameAndDescriptionForm';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
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
        {t(
          "Review your VirtualMachine configuration. After the name is set, you're ready to create your VirtualMachine.",
        )}
      </StackItem>
      <StackItem>
        <ReviewGrid />
      </StackItem>
      <StackItem isFilled />
      <StackItem>
        <hr className="pf-v6-c-divider" />
      </StackItem>
      <StackItem>
        <NameAndDescriptionForm />
      </StackItem>
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
