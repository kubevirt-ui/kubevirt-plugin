import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useWizardFooterProps from '@kubevirt-utils/hooks/useWizardFooterProps';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  Stack,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import VMNameConfirmationNextButton from '@virtualmachines/creation-wizard-new/components/VMNameConfirmationNextButton';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard-new/hooks/useCreateVM';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard-new/utils/utils';
import { getCreateButtonText } from '../utils/utils';

const ReviewAndCreateStepFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const { goToPrevStep } = useWizardContext();
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const { createVM, error, isSubmitting } = useCreateVM();
  const closeWizard = useCloseWizard();
  const { backButtonText, cancelButtonText } = useWizardFooterProps();

  const createButtonText = getCreateButtonText(isCloneMethod, isSubmitting, t);

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
