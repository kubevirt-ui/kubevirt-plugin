import React, { type FC, type MouseEvent, type Ref, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getTemplateListURL } from '@kubevirt-utils/resources/template';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import { getFleetTemplatesURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import { CreateTemplateItems } from './constants';
import useAddCreateFromVMToast from './hooks/useAddCreateFromVMToast';

const VirtualMachineTemplatesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const addCreateFromVMToast = useAddCreateFromVMToast();
  const cluster = useSelectedCluster();
  const selectedNamespaces = useListNamespaces();
  const isACMPage = useIsACMPage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const currentNamespace = selectedNamespaces?.[0];
  const namespace = currentNamespace ?? DEFAULT_NAMESPACE;

  const canCreateTemplate = useCanCreateResource({
    cluster,
    model: TemplateModel,
    namespace,
  });

  const onSelect = useCallback(
    (_event: MouseEvent, value: string) => {
      setIsOpen(false);
      if (value === CreateTemplateItems.yaml) {
        return navigate(
          isACMPage && cluster
            ? `${getFleetTemplatesURL(cluster, namespace)}/~new`
            : `${getTemplateListURL(namespace)}/~new`,
        );
      }

      if (value === CreateTemplateItems.fromVM) {
        navigate(
          getVMListPath(currentNamespace, cluster, `${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}`),
        );
        return addCreateFromVMToast();
      }

      if (value === CreateTemplateItems.fromTemplate) {
        return createModal?.(({ isOpen: isModalOpen, onClose }) => (
          <CloneTemplateModal isOpen={isModalOpen} onClose={onClose} />
        ));
      }
    },
    [cluster, isACMPage, namespace, navigate, createModal, currentNamespace, addCreateFromVMToast],
  );

  const createButtonText = t('Create template');

  if (!canCreateTemplate) {
    return (
      <span id="tour-step-create-template">
        <NoPermissionButton>{createButtonText}</NoPermissionButton>
      </span>
    );
  }

  return (
    <span id="tour-step-create-template">
      <Dropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        popperProps={{ position: 'end' }}
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            data-test="item-create"
            isExpanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            ref={toggleRef}
            variant="primary"
          >
            {createButtonText}
          </MenuToggle>
        )}
      >
        <DropdownList>
          <DropdownItem
            description={t('Clone and customize a template.')}
            key={CreateTemplateItems.fromTemplate}
            value={CreateTemplateItems.fromTemplate}
          >
            {t('From an existing template')}
          </DropdownItem>
          <DropdownItem
            description={t('Save an existing VM as a template.')}
            isExternalLink
            key={CreateTemplateItems.fromVM}
            value={CreateTemplateItems.fromVM}
          >
            {t('From a virtual machine')}
          </DropdownItem>
          <DropdownItem key={CreateTemplateItems.yaml} value={CreateTemplateItems.yaml}>
            {t('With YAML')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </span>
  );
};

export default VirtualMachineTemplatesCreateButton;
