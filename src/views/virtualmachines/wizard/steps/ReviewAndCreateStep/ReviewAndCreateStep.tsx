import { type FC } from 'react';
import { useWatch } from 'react-hook-form';
import produce from 'immer';

import { useRunStrategyToggle } from '@kubevirt-utils/components/RunStrategyModal/useRunStrategyToggle';
import {
  getStartAfterCreationLabel,
  START_AFTER_CREATION_CHECKBOX_ID,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useWizardReviewVM } from '@virtualmachines/wizard/hooks/useWizardReviewVM';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import ReviewGrid from '@virtualmachines/wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, getValues, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
  const vm = useWizardReviewVM();
  const isCloneMethod = isCloneCreationMethod(creationMethod);

  const { isStartChecked, onToggle } = useRunStrategyToggle(vm ?? undefined);
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
          id={START_AFTER_CREATION_CHECKBOX_ID}
          isChecked={isStartChecked}
          label={getStartAfterCreationLabel(t)}
          onChange={(_event, checked: boolean) => {
            const { newStrategy } = onToggle(checked);
            const runStrategyPatch = [{ data: newStrategy, path: 'spec.runStrategy' }];
            if (isCloneMethod) {
              setValue(
                'clone.sourceVM',
                produce(getValues('clone.sourceVM'), (draft) => {
                  draft.spec.runStrategy = newStrategy;
                }),
              );
            } else {
              patchWizardCustomizedVM(getValues, setValue, runStrategyPatch);
            }
          }}
        />
      </StackItem>
    </Stack>
  );
};

export default ReviewAndCreateStep;
