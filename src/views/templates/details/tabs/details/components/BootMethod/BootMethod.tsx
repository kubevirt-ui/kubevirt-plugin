import React, { FC, useCallback } from 'react';

import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import TemplateBootloaderModal from './TemplateBootloaderModal';

type BootMethodProps = {
  editable: boolean;
  template: V1Template;
};

const BootMethod: FC<BootMethodProps> = ({ editable, template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const firmwareBootloaderTitle = getBootloaderTitleFromVM(
    getTemplateVirtualMachineObject(template),
  );
  const onSubmit = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <TemplateBootloaderModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      descriptionData={firmwareBootloaderTitle}
      descriptionHeader={t('Boot mode')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default BootMethod;
