import React, { FC } from 'react';
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
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import VMNameConfirmationNextButton from '@virtualmachines/creation-wizard-new/components/VMNameConfirmationNextButton';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard-new/utils/utils';

const DeploymentDetailsStepFooter: FC = () => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const { goToNextStep } = useWizardContext();
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: 'vmData.creationMethod' });
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const closeWizard = useCloseWizard();
  const { backButtonText, cancelButtonText, nextButtonText } = useWizardFooterProps();

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button isDisabled variant="secondary">
              {backButtonText}
            </Button>
          </ActionListItem>
          <ActionListItem>
            {isCloneMethod ? (
              <Button onClick={goToNextStep} variant="primary">
                {nextButtonText}
              </Button>
            ) : (
              <VMNameConfirmationNextButton onClick={goToNextStep}>
                {nextButtonText}
              </VMNameConfirmationNextButton>
            )}
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              className={classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole })}
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
