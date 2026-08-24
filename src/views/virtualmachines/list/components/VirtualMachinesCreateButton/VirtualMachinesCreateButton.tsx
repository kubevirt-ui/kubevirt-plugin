/* eslint-disable */
import React, { FC, MouseEvent, Ref, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { DEFAULT_NAMESPACE, YAML } from '@kubevirt-utils/constants/constants';
import { TELEMETRY_VM_CREATION_METHOD } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMCreationStarted } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useCluster from '@multicluster/hooks/useCluster';
import { getACMVMListURL, navigateToVMWizard } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import {
  getCanCreateVMFleetAccessReview,
  getDisabledCreateVMTooltip,
} from '@virtualmachines/list/utils/utils';

type VirtualMachinesCreateButtonProps = {
  buttonText?: string;
  namespace: string;
  showDropdown?: boolean;
};

const VirtualMachinesCreateButton: FC<VirtualMachinesCreateButtonProps> = ({
  buttonText,
  namespace,
  showDropdown = true,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isACMPage = useIsACMPage();
  const cluster = useCluster();
  const selectedNamespace = namespace || DEFAULT_NAMESPACE;

  const [canCreateVM] = useFleetAccessReview(
    getCanCreateVMFleetAccessReview(selectedNamespace, cluster),
  );

  const wizardCluster = useMemo(() => (isACMPage ? cluster || '' : ''), [isACMPage, cluster]);

  const yamlURL = useMemo(
    () =>
      isACMPage
        ? `${getACMVMListURL(cluster, selectedNamespace)}/~new`
        : `${getVMListPath(selectedNamespace)}/~new`,
    [isACMPage, cluster, selectedNamespace],
  );

  const onSelect = useCallback(
    (_event: MouseEvent, value: string) => {
      setIsOpen(false);
      switch (value) {
        case YAML:
          logVMCreationStarted(TELEMETRY_VM_CREATION_METHOD.SCRATCH);
          return navigate(yamlURL);
        default:
          return navigateToVMWizard({ cluster: wizardCluster, namespace, navigate });
      }
    },
    [navigate, wizardCluster, namespace, yamlURL],
  );

  const disabledTooltip = getDisabledCreateVMTooltip(t, isEmpty(namespace));

  const isDisabled = useMemo(() => !canCreateVM, [canCreateVM]);

  if (!showDropdown) {
    return (
      <HidableTooltip content={disabledTooltip} hidden={canCreateVM}>
        <Button
          data-test="item-create"
          isAriaDisabled={isDisabled}
          onClick={() => navigateToVMWizard({ cluster: wizardCluster, namespace, navigate })}
          variant="primary"
          isDisabled={isDisabled}
        >
          {buttonText ?? t('Create VirtualMachine')}
        </Button>
      </HidableTooltip>
    );
  }

  return (
    <HidableTooltip content={disabledTooltip} hidden={canCreateVM}>
      <span id="tour-step-create-button">
        <Dropdown
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle
              splitButtonItems={[
                <MenuToggleAction
                  aria-label={t('Create VirtualMachine')}
                  isDisabled={isDisabled}
                  key="create-vm"
                  onClick={() =>
                    navigateToVMWizard({ cluster: wizardCluster, namespace, navigate })
                  }
                >
                  {t('Create')}
                </MenuToggleAction>,
              ]}
              data-test="item-create"
              isDisabled={isDisabled}
              isExpanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              ref={toggleRef}
              variant="primary"
            />
          )}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={onSelect}
        >
          <DropdownList>
            <DropdownItem key={YAML} value={YAML}>
              {t('With YAML')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </span>
    </HidableTooltip>
  );
};

export default VirtualMachinesCreateButton;
