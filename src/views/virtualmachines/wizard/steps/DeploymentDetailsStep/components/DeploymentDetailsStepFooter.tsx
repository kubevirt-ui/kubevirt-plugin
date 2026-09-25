import { type FC } from 'react';
import { useWatch } from 'react-hook-form';
import classnames from 'classnames';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import useWizardFooterProps from '@kubevirt-utils/hooks/useWizardFooterProps';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import VMNameConfirmationNextButton from '@virtualmachines/wizard/components/VMNameConfirmationNextButton';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardFooterNavigation from '@virtualmachines/wizard/hooks/useWizardFooterNavigation';
import { type WizardStepNavItemConfig } from '@virtualmachines/wizard/utils/types';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

const DeploymentDetailsStepFooter: FC<{ navigation: WizardStepNavItemConfig }> = ({
  navigation,
}) => {
  const { control } = useVMWizardForm();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const { isNextDisabled, onNext } = useWizardFooterNavigation(navigation);
  const closeWizard = useCloseWizard();
  const { backButtonText, cancelButtonText, nextButtonText } = useWizardFooterProps();

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button data-test="wizard-back-button" isDisabled variant="secondary">
              {backButtonText}
            </Button>
          </ActionListItem>
          <ActionListItem>
            {isCloneCreationMethod(creationMethod) ? (
              <Button data-test="wizard-next-button" isDisabled={isNextDisabled} onClick={onNext}>
                {nextButtonText}
              </Button>
            ) : (
              <VMNameConfirmationNextButton onClick={onNext} validateOnClick={false}>
                {nextButtonText}
              </VMNameConfirmationNextButton>
            )}
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              className={classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole })}
              data-test="wizard-cancel-button"
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

export default DeploymentDetailsStepFooter;
