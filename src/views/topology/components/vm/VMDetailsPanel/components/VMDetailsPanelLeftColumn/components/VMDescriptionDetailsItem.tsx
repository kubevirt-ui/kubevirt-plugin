import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { updateDescription } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMDescriptionDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMDescriptionDetailsItem: FC<VMDescriptionDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <DescriptionItem
      descriptionData={
        getAnnotation(vm, DESCRIPTION_ANNOTATION) || <MutedTextSpan text={t('None')} />
      }
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <DescriptionModal
            isOpen={isOpen}
            obj={vm}
            onClose={onClose}
            onSubmit={(description) => updateDescription(vm, description)}
          />
        ))
      }
      className="topology-vm-details-panel__item"
      data-test-id={`${getName(vm)}-description`}
      descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
      isEdit
    />
  );
};

export default VMDescriptionDetailsItem;
