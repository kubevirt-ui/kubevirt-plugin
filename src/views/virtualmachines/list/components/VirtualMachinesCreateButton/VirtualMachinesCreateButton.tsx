import React, { FC, MouseEvent, Ref, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE, YAML } from '@kubevirt-utils/constants/constants';
import { TELEMETRY_VM_CREATION_METHOD } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMCreationStarted } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import useCluster from '@multicluster/hooks/useCluster';
import { getACMVMListURL, getVMWizardURL } from '@multicluster/urls';
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

  const [canCreateVM] = useFleetAccessReview({
    cluster,
    group: VirtualMachineModel.apiGroup,
    namespace: selectedNamespace,
    resource: VirtualMachineModel.plural,
    verb: 'create',
  });

  const vmWizardURL = useMemo(
    () => getVMWizardURL(isACMPage ? cluster || '' : '', namespace),
    [isACMPage, cluster, namespace],
  );

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
          return navigate(vmWizardURL, { state: { namespace } });
      }
    },
    [navigate, vmWizardURL, yamlURL],
  );

  if (!canCreateVM) return null;

  if (!showDropdown) {
    return (
      <Button data-test="item-create" onClick={() => navigate(vmWizardURL)} variant="primary">
        {buttonText ?? t('Create VirtualMachine')}
      </Button>
    );
  }

  return (
    <span id="tour-step-create-button">
      <Dropdown
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            splitButtonItems={[
              <MenuToggleAction
                aria-label={t('Create VirtualMachine')}
                key="create-vm"
                onClick={() => navigate(vmWizardURL, { state: { namespace } })}
              >
                {t('Create')}
              </MenuToggleAction>,
            ]}
            data-test="item-create"
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
  );
};

export default VirtualMachinesCreateButton;
