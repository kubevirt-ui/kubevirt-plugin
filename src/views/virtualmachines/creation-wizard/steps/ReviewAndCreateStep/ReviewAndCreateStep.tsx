import React, { FC } from 'react';

import { getStartAfterCreationLabel } from '@kubevirt-utils/components/RunStrategyModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getDefaultRunningStrategy,
  RUNSTRATEGY_HALTED,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { updateCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { Checkbox, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import ReviewGrid from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';

import NameAndDescriptionForm from './components/NameAndDescriptionForm';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setStartVM, startVM } = useVMWizardStore();
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
            setStartVM(checked);
            updateCustomizeInstanceType([
              {
                data: checked ? getDefaultRunningStrategy() : RUNSTRATEGY_HALTED,
                path: 'spec.runStrategy',
              },
            ]);
          }}
          id="start-after-create-checkbox"
          isChecked={startVM}
          label={getStartAfterCreationLabel(t)}
        />
      </StackItem>
    </Stack>
  );
};

export default ReviewAndCreateStep;
