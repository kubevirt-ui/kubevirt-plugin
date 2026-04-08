import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { getStartAfterCreationLabel } from '@kubevirt-utils/components/RunStrategyModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getDefaultRunningStrategy,
  RUNSTRATEGY_HALTED,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Checkbox, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import ReviewGrid from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

import NameAndDescriptionForm from './components/NameAndDescriptionForm';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { creationMethod, setStartVM, startVM } = useVMWizardStore();
  const vm = vmSignal.value;
  const vmName = getName(vm);
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const cloneMethodLabel = isCloneMethod ? 'Clone' : 'Create';

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Review and create')}
        </Title>
      </StackItem>
      <StackItem>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Review and click <strong>{{ cloneMethodLabel }} VirtualMachine</strong> to start creating{' '}
          {{ vmName }}.
        </Trans>
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
