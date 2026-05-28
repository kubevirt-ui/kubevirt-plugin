import React, { FC } from 'react';
import { FormProvider } from 'react-hook-form';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant } from '@patternfly/react-core';

import { CloneTemplateField } from './form/types';
import useCloneTemplate from './hooks/useCloneTemplate';
import CloneTemplateModalBody from './CloneTemplateModalBody';

import './clone-template-modal.scss';

type CloneTemplateModalProps = {
  isOpen: boolean;
  obj?: V1Template;
  onClose: () => void;
  onTemplateCloned?: (clonedTemplate: V1Template) => void;
};

const CloneTemplateModal: FC<CloneTemplateModalProps> = ({
  isOpen,
  obj,
  onClose,
  onTemplateCloned,
}) => {
  const { t } = useKubevirtTranslation();
  const { form, onSubmit, onTemplateSelected } = useCloneTemplate(obj, onTemplateCloned);
  const template = form.watch(CloneTemplateField.template);

  return (
    <FormProvider {...form}>
      <TabModal<K8sResourceCommon>
        formClassName="clone-template-modal"
        headerText={t('Clone template')}
        isDisabled={!template}
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onSubmit={onSubmit}
        shouldWrapInForm
        submitBtnText={t('Clone')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <CloneTemplateModalBody initialTemplate={obj} onTemplateSelected={onTemplateSelected} />
      </TabModal>
    </FormProvider>
  );
};

export default CloneTemplateModal;
