import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import {
  getTemplateVirtualMachineObject,
  updateTemplate,
} from '@kubevirt-utils/resources/template';

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
  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <TemplateBootloaderModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateTemplate}
        template={template}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={firmwareBootloaderTitle}
      descriptionHeader={t('Boot mode')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default BootMethod;
