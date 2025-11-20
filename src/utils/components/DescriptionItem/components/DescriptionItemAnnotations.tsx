import React, { FC } from 'react';

import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemAnnotationsProps = {
  editable?: boolean;
  label?: string;
  model: K8sModel;
  resource: K8sResourceCommon;
};

const DescriptionItemAnnotations: FC<DescriptionItemAnnotationsProps> = ({
  editable = true,
  label,
  model,
  resource,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const annotationsCount = Object.keys(getAnnotations(resource, {})).length;
  const annotationsText = t('{{annotationsCount}} Annotations', {
    annotationsCount,
  });

  const onAnnotationsSubmit = (updatedAnnotations: { [key: string]: string }) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/annotations',
          value: updatedAnnotations,
        },
      ],
      model,
      resource,
    });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <AnnotationsModal
        isOpen={isOpen}
        obj={resource}
        onClose={onClose}
        onSubmit={onAnnotationsSubmit}
      />
    ));

  return (
    <DescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
      bodyContent={t(
        'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects.',
      )}
      breadcrumb={`${label ?? model.label}.metadata.annotations`}
      descriptionData={annotationsText}
      descriptionHeader={t('Annotations')}
      isEdit={editable}
      isPopover
      moreInfoURL={documentationURL.ANNOTATIONS}
      onEditClick={onEditClick}
    />
  );
};

export default DescriptionItemAnnotations;
