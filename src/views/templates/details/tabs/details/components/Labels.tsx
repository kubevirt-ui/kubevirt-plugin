import React, { FC } from 'react';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { LabelsAnnotationsType, TemplateDetailsGridProps } from '../TemplateDetailsPage';

const Labels: FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  const onLabelsSubmit = (templateLabels: LabelsAnnotationsType) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: templateLabels,
        },
      ],
      model: TemplateModel,
      resource: template,
    });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <LabelsModal
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onLabelsSubmit={onLabelsSubmit}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
      bodyContent={t(
        'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
      )}
      breadcrumb="Template.metadata.labels"
      data-test-id={`${template?.metadata?.name}-labels`}
      descriptionData={<MetadataLabels labels={template?.metadata?.labels} model={TemplateModel} />}
      descriptionHeader={t('Labels')}
      isEdit={editable}
      isPopover
      moreInfoURL="http://kubernetes.io/docs/user-guide/labels"
      onEditClick={onEditClick}
      showEditOnTitle
    />
  );
};

export default Labels;
