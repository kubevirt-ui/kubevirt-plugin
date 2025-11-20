import * as React from 'react';
import produce from 'immer';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { K8sModel, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemDescriptionProps = {
  editable?: boolean;
  model: K8sModel;
  resource: K8sResourceCommon;
};

const DescriptionItemDescription: React.FC<DescriptionItemDescriptionProps> = ({
  editable = true,
  model,
  resource,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const description = getAnnotations(resource)?.description || <MutedTextSpan text={t('None')} />;

  const updateDescription = (updatedDescription: string) => {
    const updatedResource = produce<K8sResourceCommon>(
      resource,
      (resourceDraft: K8sResourceCommon) => {
        if (!resourceDraft.metadata.annotations) resourceDraft.metadata.annotations = {};

        if (updatedDescription) {
          resourceDraft.metadata.annotations.description = updatedDescription;
        } else {
          delete resourceDraft.metadata.annotations.description;
        }
        return resourceDraft;
      },
    );

    return k8sUpdate({
      data: updatedResource,
      model,
      name: getName(updatedResource),
      ns: getNamespace(updatedResource),
    });
  };

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <DescriptionModal
        isOpen={isOpen}
        obj={resource}
        onClose={onClose}
        onSubmit={updateDescription}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={description}
      descriptionHeader={t('Description')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default DescriptionItemDescription;
