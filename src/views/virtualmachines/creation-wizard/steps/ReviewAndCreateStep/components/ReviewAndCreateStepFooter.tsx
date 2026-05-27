import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useWizardFooterProps from '@kubevirt-utils/hooks/useWizardFooterProps';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import VMNameConfirmationNextButton from '@virtualmachines/creation-wizard/components/VMNameConfirmationNextButton';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard/hooks/useCreateVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewAndCreateStepFooter: FC = () => {
  const { goToPrevStep } = useWizardContext();
  const { creationMethod } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const createVM = useCreateVM();
  const closeWizard = useCloseWizard();
  const { backButtonText, cancelButtonText } = useWizardFooterProps();

  const createButtonText = isCloneMethod ? t('Clone VirtualMachine') : t('Create VirtualMachine');

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button onClick={goToPrevStep} variant="secondary">
              {backButtonText}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <VMNameConfirmationNextButton onClick={createVM}>
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
    </WizardFooterWrapper>
  );
};

export default ReviewAndCreateStepFooter;
