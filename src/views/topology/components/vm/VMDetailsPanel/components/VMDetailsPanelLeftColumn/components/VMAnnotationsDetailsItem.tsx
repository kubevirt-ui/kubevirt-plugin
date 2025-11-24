import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { updateAnnotation } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import MetadataTabAnnotations from '@virtualmachines/details/tabs/configuration/metadata/components/MetadataTabAnnotations/MetadataTabAnnotations';

import '../../../TopologyVMDetailsPanel.scss';

type VMAnnotationsDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMAnnotationsDetailsItem: FC<VMAnnotationsDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <DescriptionItem
      bodyContent={t(
        'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects.',
      )}
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <AnnotationsModal
            isOpen={isOpen}
            obj={vm}
            onClose={onClose}
            onSubmit={(annotations) => updateAnnotation(vm, annotations)}
          />
        ))
      }
      breadcrumb="VirtualMachine.metadata.annotations"
      className="topology-vm-details-panel__item"
      descriptionData={<MetadataTabAnnotations annotations={getAnnotations(vm)} />}
      descriptionHeader={<SearchItem id="metadata">{t('Annotations')}</SearchItem>}
      isEdit
      isPopover
      moreInfoURL={documentationURL.ANNOTATIONS}
    />
  );
};

export default VMAnnotationsDetailsItem;
