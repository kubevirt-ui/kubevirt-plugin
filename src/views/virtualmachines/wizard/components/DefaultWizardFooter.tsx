import { type FC } from 'react';

import { WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardFooterNavigation from '@virtualmachines/wizard/hooks/useWizardFooterNavigation';
import { type WizardStepNavItemConfig } from '@virtualmachines/wizard/utils/types';

import {
  WIZARD_BACK_BUTTON_PROPS,
  WIZARD_CANCEL_BUTTON_PROPS,
  WIZARD_NEXT_BUTTON_PROPS,
} from './constants';

type DefaultWizardFooterProps = {
  navigation: WizardStepNavItemConfig;
};

const DefaultWizardFooter: FC<DefaultWizardFooterProps> = ({ navigation }) => {
  const { activeStep, isBackDisabled, isNextDisabled, onBack, onNext } =
    useWizardFooterNavigation(navigation);
  const closeWizard = useCloseWizard();

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={WIZARD_BACK_BUTTON_PROPS}
      cancelButtonProps={{ ...WIZARD_CANCEL_BUTTON_PROPS, isDisabled: navigation.isGeneratingVM }}
      isBackDisabled={isBackDisabled}
      isNextDisabled={isNextDisabled}
      nextButtonProps={{ ...WIZARD_NEXT_BUTTON_PROPS, isLoading: navigation.isGeneratingVM }}
      onBack={onBack}
      onClose={closeWizard}
      onNext={onNext}
    />
  );
};

export default DefaultWizardFooter;
