import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import BlueSyncIcon from '@kubevirt-utils/icons/BlueSyncIcon';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { Button, Tooltip } from '@patternfly/react-core';

type GenerateVMNameButtonProps = {
  applyName: (name: string) => void;
};

const GenerateVMNameButton: FC<GenerateVMNameButtonProps> = ({ applyName }) => {
  const { t } = useKubevirtTranslation();
  const tooltipContent = t('Generate unique VM name');

  return (
    <Tooltip content={tooltipContent}>
      <Button
        aria-label={tooltipContent}
        data-test="generate-vm-name-button"
        onClick={() => applyName(generatePrettyName())}
        variant="plain"
      >
        <BlueSyncIcon />
      </Button>
    </Tooltip>
  );
};

export default GenerateVMNameButton;
