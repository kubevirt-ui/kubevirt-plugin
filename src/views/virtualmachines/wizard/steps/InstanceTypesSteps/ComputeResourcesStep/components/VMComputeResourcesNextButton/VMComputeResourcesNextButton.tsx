import { type FC, type ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import VMWizardNextButton from '@virtualmachines/wizard/components/VMWizardNextButton/VMWizardNextButton';

import { getDisabledTooltipText } from './utils/getDisabledTooltipText';

type VMComputeResourcesNextButtonProps = {
  children: ReactNode;
  defaultNadError?: Error;
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
};

const VMComputeResourcesNextButton: FC<VMComputeResourcesNextButtonProps> = ({
  children,
  defaultNadError,
  isDisabled = false,
  isLoading = false,
  onClick,
}) => {
  const { t } = useKubevirtTranslation();
  const disabledTooltip = getDisabledTooltipText(defaultNadError, t);

  return (
    <VMWizardNextButton
      disabledTooltip={disabledTooltip}
      isDisabled={isDisabled || Boolean(defaultNadError)}
      isLoading={isLoading}
      onClick={onClick}
    >
      {children}
    </VMWizardNextButton>
  );
};

export default VMComputeResourcesNextButton;
