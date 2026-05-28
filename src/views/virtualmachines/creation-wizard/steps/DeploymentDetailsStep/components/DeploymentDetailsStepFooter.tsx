import React, { FC } from 'react';
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
import VMNameConfirmationNextButton from '@virtualmachines/creation-wizard/components/VMNameConfirmationNextButton';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const DeploymentDetailsStepFooter: FC = () => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const { goToNextStep } = useWizardContext();
  const { creationMethod } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const closeWizard = useCloseWizard();
  const { cancelButtonText, nextButtonText } = useWizardFooterProps();

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
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
