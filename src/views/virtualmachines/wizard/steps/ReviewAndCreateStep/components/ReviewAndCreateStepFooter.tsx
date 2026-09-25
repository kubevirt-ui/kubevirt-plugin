import { type FC } from 'react';
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
  WizardFooterWrapper,
} from '@patternfly/react-core';
import VMNameConfirmationNextButton from '@virtualmachines/wizard/components/VMNameConfirmationNextButton';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/wizard/hooks/useCreateVM';
import useWizardFooterNavigation from '@virtualmachines/wizard/hooks/useWizardFooterNavigation';
import { type WizardStepNavItemConfig } from '@virtualmachines/wizard/utils/types';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

import { getCreateButtonText } from '../utils/utils';

const ReviewAndCreateStepFooter: FC<{ navigation: WizardStepNavItemConfig }> = ({ navigation }) => {
  const { t } = useKubevirtTranslation();
  const { isBackDisabled, onBack } = useWizardFooterNavigation(navigation);
  const { control } = useVMWizardForm();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
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
              <Button
                data-test="wizard-back-button"
                isDisabled={isBackDisabled}
                onClick={onBack}
                variant="secondary"
              >
                {backButtonText}
              </Button>
            </ActionListItem>
            <ActionListItem data-test="create-virtual-machine">
              <VMNameConfirmationNextButton
                dataTest="wizard-create-button"
                isSubmitting={isSubmitting}
                onClick={createVM}
              >
                {createButtonText}
              </VMNameConfirmationNextButton>
            </ActionListItem>
          </ActionListGroup>
          <ActionListGroup>
            <ActionListItem>
              <Button data-test="wizard-cancel-button" onClick={closeWizard} variant="link">
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
