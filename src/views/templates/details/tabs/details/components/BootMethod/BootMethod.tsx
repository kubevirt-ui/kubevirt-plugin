import * as React from 'react';
import { isCommonVMTemplate } from 'src/views/templates/utils/utils';

import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
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

import TemplateBootloaderModal from './TemplateBootloaderModal';

type BootMethodProps = {
  template: V1Template;
};

const BootMethod: React.FC<BootMethodProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isCommonTemplate = isCommonVMTemplate(template);
  const firmwareBootloaderTitle = getBootloaderTitleFromVM(
    getTemplateVirtualMachineObject(template),
    t,
  );
  const onSubmit = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      }),
    [],
  );

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <TemplateBootloaderModal
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Boot mode')}</DescriptionListTerm>
      <DescriptionListDescription>
        {!isCommonTemplate ? (
          <Button type="button" isInline onClick={onEditClick} variant="link">
            {firmwareBootloaderTitle}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <MutedTextSpan text={firmwareBootloaderTitle} />
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default BootMethod;
