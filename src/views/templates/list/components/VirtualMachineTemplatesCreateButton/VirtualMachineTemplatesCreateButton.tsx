import React, { FC, MouseEvent, Ref, useCallback, useState } from 'react';
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
import { getFleetTemplatesURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import { CreateTemplateItems } from './constants';

const VirtualMachineTemplatesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const cluster = useSelectedCluster();
  const selectedNamespaces = useListNamespaces();
  const isACMPage = useIsACMPage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const namespace = selectedNamespaces?.[0] || DEFAULT_NAMESPACE;

  const [canCreateTemplate] = useFleetAccessReview({
    cluster,
    group: TemplateModel.apiGroup,
    namespace,
    resource: TemplateModel.plural,
    verb: 'create',
  });

  const onSelect = useCallback(
    (_event: MouseEvent, value: string) => {
      setIsOpen(false);
      if (value === CreateTemplateItems.yaml) {
        return navigate(
          isACMPage
            ? `${getFleetTemplatesURL(cluster, namespace)}/~new`
            : `${getTemplateListURL(namespace)}/~new`,
        );
      }

      if (value === CreateTemplateItems.fromVM) {
        return navigate(
          getVMListPath(namespace, cluster, `${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}`),
        );
      }

      if (value === CreateTemplateItems.fromTemplate) {
        return createModal(({ isOpen: isModalOpen, onClose }) => (
          <CloneTemplateModal isOpen={isModalOpen} onClose={onClose} />
        ));
      }
    },
    [cluster, isACMPage, namespace, navigate, createModal, currentNamespace, addCreateFromVMToast],
  );

  return (
    <span id="tour-step-create-template">
      <Dropdown
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            data-test="item-create"
            isExpanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            ref={toggleRef}
            variant="primary"
          >
            {t('Create template')}
          </MenuToggle>
        )}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        popperProps={{ position: 'end' }}
      >
        <DropdownList>
          <DropdownItem
            description={t('Clone and customize a template.')}
            isDisabled={!canCreateTemplate}
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
          <DropdownItem
            isDisabled={!canCreateTemplate}
            key={CreateTemplateItems.yaml}
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
