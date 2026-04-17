import React, { FC, MouseEvent, Ref, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE, YAML } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import useCluster from '@multicluster/hooks/useCluster';
import { getACMVMListURL, getVMWizardURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from '@patternfly/react-core';

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

  const [canCreateVM] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: selectedNamespace,
    resource: VirtualMachineModel.plural,
    verb: 'create',
  });

  const vmWizardURL = useMemo(
    () => getVMWizardURL(isACMPage ? cluster || '' : ''),
    [isACMPage, cluster],
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
          return navigate(yamlURL);
        default:
          return navigate(vmWizardURL);
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
                onClick={() => navigate(vmWizardURL)}
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
