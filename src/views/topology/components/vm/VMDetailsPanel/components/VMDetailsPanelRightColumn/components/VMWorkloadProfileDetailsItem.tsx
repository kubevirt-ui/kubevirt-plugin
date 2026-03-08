import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
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
      <DescriptionItem
        descriptionData={
          vmWorkload ? (
            (() => {
              const workloadKey = WORKLOADS_LABELS[vmWorkload];
              return workloadKey ? t(workloadKey) : vmWorkload;
            })()
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
