import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { RUNSTRATEGY_ALWAYS, RUNSTRATEGY_HALTED } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Checkbox, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { updateWizardVM } from '@virtualmachines/creation-wizard/state/vm-signal/utils';
import { wizardVMSignal } from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import ReviewGrid from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/ReviewGrid';

import NameAndDescriptionForm from './components/NameAndDescriptionForm';

const ReviewAndCreateStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setStartVM, startVM } = useVMWizardStore();
  const vm = wizardVMSignal.value;
  const vmName = getName(vm);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Review and create')}
        </Title>
      </StackItem>
      <StackItem>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Review and click <strong>Create VirtualMachine</strong> to start creating {{ vmName }}.
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
            updateWizardVM([
              {
                data: checked ? RUNSTRATEGY_ALWAYS : RUNSTRATEGY_HALTED,
                path: 'spec.runStrategy',
              },
            ]);
          }}
          id="start-after-create-checkbox"
          isChecked={startVM}
          label={t('Start this VirtualMachine after creation')}
        />
      </StackItem>
    </Stack>
  );
};

export default ReviewAndCreateStep;
