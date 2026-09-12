import React, { type FC } from 'react';
import { type TFunction } from 'i18next';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { INSTANCETYPE_CLASS_DISPLAY_NAME } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import NUMABadge from '@kubevirt-utils/components/badges/NUMABadge/NUMABadge';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import InstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/InstanceTypeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { type WorkloadTypeTelemetry } from '@kubevirt-utils/extensions/telemetry/utils/types';
import { logVMWorkloadCollected } from '@kubevirt-utils/extensions/telemetry/workload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { type WORKLOADS, WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import {
  getCPU,
  getInstanceTypeMatcher,
  getMachineType,
  getWorkload,
  hasNUMAConfiguration,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { OLSPromptType } from '@lightspeed/utils/prompts';

import { updatedInstanceType, updatedVirtualMachine, updateWorkload } from '../utils/utils';

type DetailsSectionComputeItemsProps = {
  allInstanceTypes: InstanceTypeUnion[];
  canUpdateVM: boolean;
  cpuMemoryVM: V1VirtualMachine;
  instanceType?: InstanceTypeUnion;
  isInstanceType: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  vmName: string;
};

const getWorkloadLabel = (vmWorkload: WORKLOADS | undefined, t: TFunction): React.ReactNode => {
  if (!vmWorkload) {
    return <MutedTextSpan text={t('Not available')} />;
  }
  const workloadKey = WORKLOADS_LABELS[vmWorkload];
  return workloadKey ? t(workloadKey) : vmWorkload;
};

const DetailsSectionComputeItems: FC<DetailsSectionComputeItemsProps> = ({
  allInstanceTypes,
  canUpdateVM,
  cpuMemoryVM,
  instanceType,
  isInstanceType,
  vm,
  vmi,
  vmName,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const vmWorkload = getWorkload(vm);

  return (
    <>
      {!getInstanceTypeMatcher(vm) && (
        <DescriptionItem
          data-test={`${vmName}-workload-profile`}
          descriptionData={getWorkloadLabel(vmWorkload, t)}
          descriptionHeader={<SearchItem id="workload-profile">{t('Workload profile')}</SearchItem>}
          isEdit
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <WorkloadProfileModal
                initialWorkload={vmWorkload}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={async (workload) => {
                  const result = await updateWorkload(vm, workload);
                  logVMWorkloadCollected({
                    workloadType: workload as WorkloadTypeTelemetry,
                  });
                  return result;
                }}
              />
            ))
          }
        />
      )}
      <DescriptionItem
        additionalContent={hasNUMAConfiguration(cpuMemoryVM) && <NUMABadge />}
        bodyContent={isInstanceType ? null : <CPUDescription cpu={getCPU(vm)} />}
        data-test={`${vmName}-cpu-memory`}
        descriptionData={<CPUMemory vm={cpuMemoryVM ?? vm} vmi={vmi} />}
        descriptionHeader={
          <SearchItem id="cpu-memory">
            {isInstanceType ? t('InstanceType') : t('CPU | Memory')}
          </SearchItem>
        }
        isEdit={canUpdateVM}
        isPopover
        olsObj={vm}
        onEditClick={() =>
          createModal(({ isOpen, onClose }) =>
            isInstanceType ? (
              <InstanceTypeModal
                allInstanceTypes={allInstanceTypes}
                instanceType={instanceType}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updatedInstanceType}
                vm={vm}
              />
            ) : (
              <CPUMemoryModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updatedVirtualMachine}
                vm={vm}
              />
            ),
          )
        }
        promptType={OLSPromptType.CPU_MEMORY}
        subTitle={instanceType && getAnnotation(instanceType, INSTANCETYPE_CLASS_DISPLAY_NAME)}
      />
      <DescriptionItem
        bodyContent={t('The QEMU machine type.')}
        descriptionData={getMachineType(vm) ?? NO_DATA_DASH}
        descriptionHeader={t('Machine type')}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.MACHINE_TYPE}
      />
    </>
  );
};

export default DetailsSectionComputeItems;
