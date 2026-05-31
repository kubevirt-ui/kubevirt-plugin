import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useWizardFooterProps from '@kubevirt-utils/hooks/useWizardFooterProps';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { Stack } from '@patternfly/react-core';
import VMNameConfirmationNextButton from '@virtualmachines/creation-wizard/components/VMNameConfirmationNextButton';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard/hooks/useCreateVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewAndCreateStepFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const { goToPrevStep } = useWizardContext();
  const { creationMethod } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const { createVM, error, isSubmitting } = useCreateVM();
  const closeWizard = useCloseWizard();
  const { backButtonText, cancelButtonText } = useWizardFooterProps();

  const createButtonText = isCloneMethod ? t('Clone VirtualMachine') : t('Create VirtualMachine');

  return (
    <WizardFooterWrapper>
      <Stack hasGutter>
        {error && <ErrorAlert error={error} />}
        <ActionList>
          <ActionListGroup>
            <ActionListItem>
              <Button onClick={goToPrevStep} variant="secondary">
                {backButtonText}
              </Button>
            </ActionListItem>
            <ActionListItem>
              <VMNameConfirmationNextButton isSubmitting={isSubmitting} onClick={createVM}>
                {createButtonText}
              </VMNameConfirmationNextButton>
            </ActionListItem>
          </ActionListGroup>
          <ActionListGroup>
            <ActionListItem>
              <Button onClick={closeWizard} variant="link">
                {cancelButtonText}
              </Button>
            </ActionListItem>
          </ActionListGroup>
        </ActionList>
      </Stack>
    </WizardFooterWrapper>
  );
};

export default ReviewAndCreateStepFooter;
