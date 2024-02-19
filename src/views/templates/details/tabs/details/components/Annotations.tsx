import * as React from 'react';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { LabelsAnnotationsType, TemplateDetailsGridProps } from '../TemplateDetailsPage';

const Annotations: React.FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const annotationsCount = Object.keys(template?.metadata?.annotations || {}).length;
  const annotationsText = t('{{annotationsCount}} Annotations', {
    annotationsCount,
  });

  const onAnnotationsSubmit = (updatedAnnotations: LabelsAnnotationsType) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/annotations',
          value: updatedAnnotations,
        },
      ],
      model: TemplateModel,
      resource: template,
    });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <AnnotationsModal
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onSubmit={onAnnotationsSubmit}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
      bodyContent={t(
        'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
      )}
      breadcrumb="Template.metadata.annotations"
      descriptionData={annotationsText}
      descriptionHeader={t('Annotations')}
      isEdit={editable}
      isPopover
      moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
      onEditClick={onEditClick}
    />
  );
};

export default Annotations;
