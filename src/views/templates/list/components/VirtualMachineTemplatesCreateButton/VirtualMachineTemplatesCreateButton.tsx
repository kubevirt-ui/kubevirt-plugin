import React, { type FC, type JSX, type MouseEvent, type Ref, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getTemplateListURL } from '@kubevirt-utils/resources/template';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { getFleetTemplatesURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  TooltipPosition,
} from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import { CreateTemplateItems } from './constants';
import useAddCreateFromVMToast from './hooks/useAddCreateFromVMToast';

const VirtualMachineTemplatesCreateButton: FC = (): JSX.Element => {
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

  const [canCreateTemplate, loading] = useFleetAccessReview({
    cluster,
    group: TemplateModel.apiGroup,
    namespace,
    resource: TemplateModel.plural,
    verb: 'create',
  });

  const isPermissionDenied = !loading && !canCreateTemplate;
  const permissionTooltipProps = isPermissionDenied
    ? { content: getNoPermissionTooltipContent(t), position: TooltipPosition.left }
    : undefined;

  const onSelect = useCallback(
    (_event: MouseEvent, value: string): void => {
      setIsOpen(false);
      if (value === CreateTemplateItems.yaml) {
        navigate(
          isACMPage && cluster
            ? `${getFleetTemplatesURL(cluster, namespace)}/~new`
            : `${getTemplateListURL(namespace)}/~new`,
        );
        return;
      }

      if (value === CreateTemplateItems.fromVM) {
        navigate(
          getVMListPath(currentNamespace, cluster, `${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}`),
        );
        addCreateFromVMToast();
        return;
      }

      if (value === CreateTemplateItems.fromTemplate) {
        createModal(({ isOpen: isModalOpen, onClose }) => (
          <CloneTemplateModal isOpen={isModalOpen} onClose={onClose} />
        ));
      }
    },
    [cluster, isACMPage, namespace, navigate, createModal, currentNamespace, addCreateFromVMToast],
  );

  const createButtonText = t('Create template');

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
            isAriaDisabled={isPermissionDenied}
            isDisabled={!canCreateTemplate && !isPermissionDenied}
            key={CreateTemplateItems.fromTemplate}
            tooltipProps={permissionTooltipProps}
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
          <DropdownItem
            isAriaDisabled={isPermissionDenied}
            isDisabled={!canCreateTemplate && !isPermissionDenied}
            key={CreateTemplateItems.yaml}
            tooltipProps={permissionTooltipProps}
            value={CreateTemplateItems.yaml}
          >
            {t('With YAML')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </span>
  );
};

export default VirtualMachineTemplatesCreateButton;
