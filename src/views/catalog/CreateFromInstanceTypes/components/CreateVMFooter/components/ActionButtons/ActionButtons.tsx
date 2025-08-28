import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { CANCEL_CREATE_VM_BUTTON_CLICKED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  Button,
  ButtonVariant,
  Split,
  SplitItem,
  Stack,
  TooltipPosition,
} from '@patternfly/react-core';

import useStatusActionButtons from './useStatusActionButtons';

type ActionButtonsProps = {
  isLoading?: boolean;
  onCreate: () => void;
  onCustomize: () => void;
  onViewYAML: () => void;
};

const ActionButtons: FC<ActionButtonsProps> = ({
  isLoading = false,
  onCreate,
  onCustomize,
  onViewYAML,
}) => {
  const navigate = useNavigate();
  const namespace = useNamespaceParam();

  const { t } = useKubevirtTranslation();

  const {
    instanceTypeVMState: { vmName },
  } = useInstanceTypeVMStore();

  const onCancel = useCallback(() => {
    logITFlowEvent(CANCEL_CREATE_VM_BUTTON_CLICKED, null, { vmName: vmName });
    navigate(getResourceUrl({ activeNamespace: namespace, model: VirtualMachineModel }));
  }, [navigate, namespace, vmName]);

  const { disableButtonTooltipContent, isCreationDisabled, isViewYAMLDisabled } =
    useStatusActionButtons(isLoading);

  return (
    <Split hasGutter>
      <SplitItem>
        <HidableTooltip
          content={<Stack>{disableButtonTooltipContent}</Stack>}
          hidden={!isCreationDisabled}
          position={TooltipPosition.top}
        >
          <Button
            isAriaDisabled={isCreationDisabled}
            isLoading={isLoading}
            onClick={onCreate}
            variant={ButtonVariant.primary}
          >
            {t('Create VirtualMachine')}
          </Button>
        </HidableTooltip>
      </SplitItem>
      <SplitItem>
        <HidableTooltip
          content={<Stack>{disableButtonTooltipContent}</Stack>}
          hidden={!isCreationDisabled}
          position={TooltipPosition.top}
        >
          <Button
            isDisabled={isCreationDisabled}
            isLoading={isLoading}
            onClick={onCustomize}
            variant={ButtonVariant.secondary}
          >
            {t('Customize VirtualMachine')}
          </Button>
        </HidableTooltip>
      </SplitItem>

      <SplitItem>
        <Button onClick={onCancel} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </SplitItem>
      <SplitItem isFilled />
      <SplitItem>
        <Button
          isDisabled={isViewYAMLDisabled}
          onClick={onViewYAML}
          variant={ButtonVariant.secondary}
        >
          {t('View YAML & CLI')}
        </Button>
      </SplitItem>
    </Split>
  );
};

export default ActionButtons;
