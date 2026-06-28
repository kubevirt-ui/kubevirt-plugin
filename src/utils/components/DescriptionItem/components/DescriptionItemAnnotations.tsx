import React, { FC, ReactNode } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { KeyValueModal } from '@kubevirt-utils/components/MetadataModal/KeyValueModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemAnnotationsProps = {
  className?: string;
  descriptionHeaderWrapper?: (children: string) => ReactNode;
  editable?: boolean;
  label?: string;
  model: K8sModel;
  onAnnotationsSubmit?: (annotations: { [key: string]: string }) => Promise<any>;
  onEditClick?: () => void;
  resource: K8sResourceCommon;
};

const DescriptionItemAnnotations: FC<DescriptionItemAnnotationsProps> = ({
  className,
  descriptionHeaderWrapper,
  editable = true,
  label,
  model,
  onAnnotationsSubmit,
  onEditClick,
  resource,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const annotationsCount = Object.keys(getAnnotations(resource, {})).length;
  const annotationsText = t('{{annotationsCount}} Annotations', { annotationsCount });

  const defaultSubmit = (updatedAnnotations: { [key: string]: string }) =>
    kubevirtK8sPatch({
      cluster: getCluster(resource),
      data: [{ op: 'replace', path: '/metadata/annotations', value: updatedAnnotations }],
      model,
      resource,
    });

  const handleEditClick =
    onEditClick ??
    (() =>
      createModal(({ isOpen, onClose }) => (
        <KeyValueModal
          isOpen={isOpen}
          obj={resource}
          onClose={onClose}
          onSubmit={onAnnotationsSubmit ?? defaultSubmit}
        />
      )));

  const annotationsHeader = t('Annotations');
  const descriptionHeader = descriptionHeaderWrapper?.(annotationsHeader) ?? annotationsHeader;

  return (
    <DescriptionItem
      bodyContent={t(
        'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects.',
      )}
      breadcrumb={`${label ?? model.label}.metadata.annotations`}
      className={className}
      descriptionData={annotationsText}
      descriptionHeader={descriptionHeader}
      isEdit={editable}
      isPopover
      moreInfoURL={documentationURL.ANNOTATIONS}
      onEditClick={handleEditClick}
      promptType={OLSPromptType.ANNOTATIONS}
    />
  );
};

export default DescriptionItemAnnotations;
