import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { getInstanceTypeMatcher, getWorkload } from '@kubevirt-utils/resources/vm';
import { updateWorkload } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMWorkloadProfileDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMWorkloadProfileDetailsItem: FC<VMWorkloadProfileDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vmWorkload = getWorkload(vm);
  const vmName = getName(vm);

  return (
    !getInstanceTypeMatcher(vm) && (
      <VirtualMachineDescriptionItem
        descriptionData={
          vmWorkload ? (
            WORKLOADS_LABELS[vmWorkload] || vmWorkload
          ) : (
            <MutedTextSpan text={t('Not available')} />
          )
        }
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <WorkloadProfileModal
              initialWorkload={vmWorkload}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={(workload) => updateWorkload(vm, workload)}
            />
          ))
        }
        className="topology-vm-details-panel__item"
        data-test-id={`${vmName}-workload-profile`}
        descriptionHeader={<SearchItem id="workload-profile">{t('Workload profile')}</SearchItem>}
        isEdit
      />
    )
  );
};

export default VMWorkloadProfileDetailsItem;
