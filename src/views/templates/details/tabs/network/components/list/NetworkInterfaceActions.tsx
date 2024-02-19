import React, { FC, useCallback, useState } from 'react';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';
import TemplatesEditNetworkInterfaceModal from '../modal/TemplatesEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  template: V1Template;
};

const NetworkInterfaceActions: FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const label = t('Delete NIC?');
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <TemplatesEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        template={template}
      />
    ));
  };

  const onDelete = useCallback(() => {
    const updatedTemplate = produce(template, (draftTemplate) => {
      const vm = getTemplateVirtualMachineObject(draftTemplate);
      vm.spec.template.spec.networks = vm.spec.template.spec.networks.filter(
        ({ name }) => name !== nicName,
      );
      vm.spec.template.spec.domain.devices.interfaces =
        vm.spec.template.spec.domain.devices.interfaces.filter(({ name }) => name !== nicName);
    });

    return k8sUpdate({
      data: updatedTemplate,
      model: TemplateModel,
      name: updatedTemplate?.metadata?.name,
      ns: updatedTemplate?.metadata?.namespace,
    });
  }, [nicName, template]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1Template>
        headerText={label}
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onSubmit={onDelete}
        submitBtnText={submitBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage
          obj={{ metadata: { name: nicName, namespace: template?.metadata?.namespace } }}
        />
      </TabModal>
    ));
  };

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Dropdown
      toggle={KebabToggle({
        id: 'toggle-id-6',
        isDisabled: !isTemplateEditable,
        isExpanded: isDropdownOpen,
        onClick: onToggle,
      })}
      isOpen={isDropdownOpen}
      onOpenChange={(open: boolean) => setIsDropdownOpen(open)}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
    >
      <DropdownList>
        <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
          {editBtnText}
        </DropdownItem>
        <DropdownItem key="network-interface-delete" onClick={onDeleteModalToggle}>
          {submitBtnText}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkInterfaceActions;
