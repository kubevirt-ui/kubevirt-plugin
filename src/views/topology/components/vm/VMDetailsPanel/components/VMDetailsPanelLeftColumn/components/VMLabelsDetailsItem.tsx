import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels, getName } from '@kubevirt-utils/resources/shared';
import { updateLabels } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import MetadataTabLabels from '@virtualmachines/details/tabs/configuration/metadata/components/MetadataTabLabels/MetadataTabLabels';

import '../../../TopologyVMDetailsPanel.scss';

type VMLabelsDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMLabelsDetailsItem: FC<VMLabelsDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <DescriptionItem
      bodyContent={t(
        'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services.',
      )}
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <LabelsModal
            isOpen={isOpen}
            obj={vm}
            onClose={onClose}
            onLabelsSubmit={(labels) => updateLabels(vm, labels)}
          />
        ))
      }
      breadcrumb="VirtualMachine.metadata.labels"
      className="topology-vm-details-panel__item"
      data-test-id={`${getName(vm)}-labels`}
      descriptionData={<MetadataTabLabels labels={getLabels(vm)} />}
      descriptionHeader={<SearchItem id="labels">{t('Labels')}</SearchItem>}
      editOnTitleJustify
      isEdit
      isPopover
      moreInfoURL={documentationURL.LABELS}
      showEditOnTitle
    />
  );
};

export default VMLabelsDetailsItem;
