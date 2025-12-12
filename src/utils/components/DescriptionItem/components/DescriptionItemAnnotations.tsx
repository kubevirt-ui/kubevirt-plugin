import React, { FC, ReactNode } from 'react';

import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemAnnotationsProps = {
  className?: string;
  descriptionHeaderWrapper?: (children: string) => ReactNode;
  editable?: boolean;
  label?: string;
  model: K8sModel;
  onAnnotationsSubmit?: (annotations: { [key: string]: string }) => Promise<any>;
  resource: K8sResourceCommon;
};

const DescriptionItemAnnotations: FC<DescriptionItemAnnotationsProps> = ({
  className,
  descriptionHeaderWrapper,
  editable = true,
  label,
  model,
  onAnnotationsSubmit,
  resource,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const annotationsCount = Object.keys(getAnnotations(resource, {})).length;
  const annotationsText = t('{{annotationsCount}} Annotations', {
    annotationsCount,
  });

  const onAnnotationsSubmitInternal = (updatedAnnotations: { [key: string]: string }) =>
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
        onSubmit={onAnnotationsSubmit ?? onAnnotationsSubmitInternal}
      />
    ));

  const annotationsHeader = t('Annotations');
  const descriptionHeader = descriptionHeaderWrapper?.(annotationsHeader) ?? annotationsHeader;

  return (
    <DescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
      bodyContent={(hide) => (
        <>
          <div>
            {t(
              'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects.',
            )}
          </div>
          <br />
          <LightspeedHelpButton onClick={hide} promptType={OLSPromptType.ANNOTATIONS} />
        </>
      )}
      breadcrumb={`${label ?? model.label}.metadata.annotations`}
      className={className}
      descriptionData={annotationsText}
      descriptionHeader={descriptionHeader}
      isEdit={editable}
      isPopover
      moreInfoURL={documentationURL.ANNOTATIONS}
      onEditClick={onEditClick}
      promptType={OLSPromptType.ANNOTATIONS}
    />
  );
};

export default DescriptionItemAnnotations;
