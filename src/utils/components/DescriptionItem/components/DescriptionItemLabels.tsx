import React, { FC, ReactNode } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels, getName } from '@kubevirt-utils/resources/shared';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemLabelsProps = {
  className?: string;
  descriptionHeaderWrapper?: (children: string) => ReactNode;
  editable?: boolean;
  label?: string;
  model: K8sModel;
  onLabelsSubmit?: (labels: { [key: string]: string }) => Promise<any>;
  resource: K8sResourceCommon;
};

const DescriptionItemLabels: FC<DescriptionItemLabelsProps> = ({
  className,
  descriptionHeaderWrapper,
  editable = true,
  label,
  model,
  onLabelsSubmit,
  resource,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  const onLabelsSubmitInternal = (labels: { [key: string]: string }) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: labels,
        },
      ],
      model,
      resource,
    });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <LabelsModal
        isOpen={isOpen}
        obj={resource}
        onClose={onClose}
        onLabelsSubmit={onLabelsSubmit ?? onLabelsSubmitInternal}
      />
    ));

  const labelsHeader = t('Labels');
  const descriptionHeader = descriptionHeaderWrapper?.(labelsHeader) ?? labelsHeader;

  return (
    <DescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
      bodyContent={t(
        'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services.',
      )}
      breadcrumb={`${label ?? model.label}.metadata.labels`}
      className={className}
      data-test-id={`${getName(resource)}-labels`}
      descriptionData={<MetadataLabels labels={getLabels(resource)} model={model} />}
      descriptionHeader={descriptionHeader}
      isEdit={editable}
      isLabelEditor
      isPopover
      moreInfoURL={documentationURL.LABELS}
      onEditClick={onEditClick}
      showEditOnTitle
    />
  );
};

export default DescriptionItemLabels;
