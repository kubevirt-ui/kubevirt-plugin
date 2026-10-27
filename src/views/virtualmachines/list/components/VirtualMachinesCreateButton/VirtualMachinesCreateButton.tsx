import { type FC, type MouseEvent, type Ref, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { DEFAULT_NAMESPACE, YAML } from '@kubevirt-utils/constants/constants';
import { TELEMETRY_VM_CREATION_METHOD } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMCreationStarted } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import useCluster from '@multicluster/hooks/useCluster';
import { getACMVMListURL, isAllClusters, navigateToVMWizard } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  type MenuToggleElement,
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
  const isAllProjectsScope = isAllNamespaces(namespace);
  // YAML create needs a concrete project for the URL; on all-projects start in `default`
  // (users can switch project in the editor if they lack create access there).
  const yamlTargetNamespace = isAllProjectsScope
    ? DEFAULT_NAMESPACE
    : namespace || DEFAULT_NAMESPACE;

  // ACM YAML route is /cluster/:cluster/ns/:ns/~new. Wait for a concrete cluster
  // (URL param or hub fallback) so we never navigate to all-clusters/.../~new.
  const hasConcreteYamlCluster = Boolean(cluster && !isAllClusters(cluster));
  const canCreateWithYaml = !isACMPage || hasConcreteYamlCluster;

  const [canCreateVMInProject] = useFleetAccessReview(
    getCanCreateVMFleetAccessReview(yamlTargetNamespace, cluster),
  );

  const canCreateVM = isAllProjectsScope || canCreateVMInProject;

  const wizardCluster = useMemo(() => (isACMPage ? (cluster ?? '') : ''), [isACMPage, cluster]);

  const yamlURL = useMemo(() => {
    if (!isACMPage) {
      return `${getVMListPath(yamlTargetNamespace)}/~new`;
    }

    if (!hasConcreteYamlCluster) {
      return null;
    }

    return `${getACMVMListURL(cluster, yamlTargetNamespace)}/~new`;
  }, [isACMPage, cluster, hasConcreteYamlCluster, yamlTargetNamespace]);

  const onSelect = useCallback(
    (_event: MouseEvent, value: string) => {
      setIsOpen(false);
      if (value === YAML) {
        logVMCreationStarted(TELEMETRY_VM_CREATION_METHOD.SCRATCH);
        return navigate(yamlURL);
      }
      return navigateToVMWizard({ cluster: wizardCluster, namespace, navigate });
    },
    [navigate, wizardCluster, namespace, yamlURL],
  );

  const disabledTooltip = getDisabledCreateVMTooltip(t, isAllProjectsScope);

  const isDisabled = useMemo(() => !canCreateVM, [canCreateVM]);

  if (!showDropdown) {
    return (
      <HidableTooltip content={disabledTooltip} hidden={canCreateVM}>
        <Button
          data-test="item-create"
          isAriaDisabled={isDisabled}
          isDisabled={isDisabled}
          onClick={() => navigateToVMWizard({ cluster: wizardCluster, namespace, navigate })}
          variant="primary"
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
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={onSelect}
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle
              data-test="item-create"
              isDisabled={isDisabled}
              isExpanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              ref={toggleRef}
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
              variant="primary"
            />
          )}
        >
          <DropdownList>
            <DropdownItem isDisabled={!canCreateWithYaml} key={YAML} value={YAML}>
              {t('With YAML')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </span>
    </HidableTooltip>
  );
};

export default VirtualMachinesCreateButton;
