import type { FC } from 'react';

import useWizardFooterProps from '@kubevirt-utils/hooks/useWizardFooterProps';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardFooterNavigation from '@virtualmachines/wizard/hooks/useWizardFooterNavigation';
import VMComputeResourcesNextButton from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/VMComputeResourcesNextButton/VMComputeResourcesNextButton';
import { type WizardStepNavItemConfig } from '@virtualmachines/wizard/utils/types';

type ComputeResourcesStepFooterProps = {
  defaultNadError?: Error;
  navigation: WizardStepNavItemConfig;
};

const ComputeResourcesStepFooter: FC<ComputeResourcesStepFooterProps> = ({
  defaultNadError,
  navigation,
}) => {
  const { isBackDisabled, isNextDisabled, onBack, onNext } = useWizardFooterNavigation(navigation);
  const closeWizard = useCloseWizard();
  const { backButtonText, cancelButtonText, nextButtonText } = useWizardFooterProps();

  return (
    <WizardFooterWrapper>
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
          <ActionListItem>
            <VMComputeResourcesNextButton
              defaultNadError={defaultNadError}
              isDisabled={isNextDisabled}
              isLoading={navigation.isGeneratingVM}
              onClick={onNext}
            >
              {nextButtonText}
            </VMComputeResourcesNextButton>
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              data-test="wizard-cancel-button"
              isDisabled={navigation.isGeneratingVM}
              onClick={closeWizard}
              variant="link"
            >
              {cancelButtonText}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default ComputeResourcesStepFooter;
