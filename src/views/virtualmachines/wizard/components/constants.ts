import { type ButtonProps } from '@patternfly/react-core';

type WizardFooterButtonProps = Omit<ButtonProps, 'children'> & { 'data-test': string };

export const WIZARD_BACK_BUTTON_PROPS: WizardFooterButtonProps = {
  'data-test': 'wizard-back-button',
};

export const WIZARD_CANCEL_BUTTON_PROPS: WizardFooterButtonProps = {
  'data-test': 'wizard-cancel-button',
};

export const WIZARD_NEXT_BUTTON_PROPS: WizardFooterButtonProps = {
  'data-test': 'wizard-next-button',
};
