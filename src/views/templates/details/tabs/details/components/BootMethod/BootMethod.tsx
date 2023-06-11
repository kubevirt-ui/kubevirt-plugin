import React, { FC, useCallback } from 'react';

import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../../../..//details/hooks/useIsTemplateEditable';

import TemplateBootloaderModal from './TemplateBootloaderModal';

type BootMethodProps = {
  template: V1Template;
};

const BootMethod: FC<BootMethodProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
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
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Boot mode')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Button
          isDisabled={!isTemplateEditable}
          isInline
          onClick={onEditClick}
          type="button"
          variant="link"
        >
          {firmwareBootloaderTitle}
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default BootMethod;
