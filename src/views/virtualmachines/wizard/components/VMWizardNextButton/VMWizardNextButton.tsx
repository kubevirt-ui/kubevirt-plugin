import { type FC, type ReactNode } from 'react';

import { Button, Tooltip } from '@patternfly/react-core';

type VMWizardNextButtonProps = {
  children: ReactNode;
  dataTest?: string;
  disabledTooltip?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
};

const VMWizardNextButton: FC<VMWizardNextButtonProps> = ({
  children,
  dataTest = 'wizard-next-button',
  disabledTooltip,
  isDisabled = false,
  isLoading = false,
  onClick,
}) => {
  const showTooltip = Boolean(isDisabled && disabledTooltip && !isLoading);

  const button = (
    <Button
      data-test={dataTest}
      isAriaDisabled={showTooltip}
      isDisabled={(isDisabled || isLoading) && !showTooltip}
      isLoading={isLoading}
      onClick={isDisabled || isLoading ? undefined : onClick}
      variant="primary"
    >
      {children}
    </Button>
  );

  return showTooltip ? <Tooltip content={disabledTooltip}>{button}</Tooltip> : button;
};

export default VMWizardNextButton;
