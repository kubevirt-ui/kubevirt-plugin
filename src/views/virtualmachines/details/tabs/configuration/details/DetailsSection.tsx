import React, { FC, useState } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1Devices,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import HeadLessMode from '@kubevirt-utils/components/HeadlessMode/HeadLessMode';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getAnnotation } from '@kubevirt-utils/resources/shared';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { DESCRIPTION_ANNOTATION, getCPU, getWorkload } from '@kubevirt-utils/resources/vm';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Switch, Title } from '@patternfly/react-core';

import DetailsSectionBoot from './components/DetailsSectionBoot';
import DetailsSectionHardware from './components/DetailsSectionHardware';
import {
  updateDescription,
  updatedHostname,
  updatedVirtualMachine,
  updateGuestSystemAccessLog,
  updateHeadlessMode,
  updateWorkload,
} from './utils/utils';

import './details-section.scss';

type DetailsSectionProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const DetailsSection: FC<DetailsSectionProps> = ({ vm, vmi }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const logSerialConsole = (
    vm?.spec?.template?.spec?.domain?.devices as V1Devices & { logSerialConsole: boolean }
  )?.logSerialConsole;
  const [isCheckedGuestSystemAccessLog, setIsCheckedGuestSystemAccessLog] = useState<boolean>(
    logSerialConsole || logSerialConsole === undefined,
  );

  const vmWorkload = getWorkload(vm);

  if (!vm) {
    return <Loading />;
  }

  return (
    <div className="VirtualMachinesDetailsSection">
      <Title headingLevel="h2">{t('Details')}</Title>
      <DescriptionList>
        <VirtualMachineDescriptionItem
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
          data-test-id={`${vm?.metadata?.name}-description`}
          descriptionHeader={t('Description')}
          isEdit
        />
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
          data-test-id={`${vm?.metadata?.name}-workload-profile`}
          descriptionHeader={t('Workload profile')}
          isEdit
        />
        <VirtualMachineDescriptionItem
          messageOnDisabled={t(
            'CPU and Memory can not be edited if the VirtualMachine is created from InstanceType',
          )}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <CPUMemoryModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updatedVirtualMachine}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          bodyContent={vm?.spec?.instancetype ? null : <CPUDescription cpu={getCPU(vm)} />}
          data-test-id={`${vm?.metadata?.name}-cpu-memory`}
          descriptionData={<CPUMemory vm={vm} />}
          descriptionHeader={t('CPU | Memory')}
          isDisabled={!!vm?.spec?.instancetype}
          isEdit={canUpdateVM}
          isPopover
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <HostnameModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updatedHostname}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-hostname`}
          descriptionData={vm?.spec?.template?.spec?.hostname || vm?.metadata?.name}
          descriptionHeader={t('Hostname')}
          isEdit
        />
        <VirtualMachineDescriptionItem
          bodyContent={t(
            'Whether to attach the default graphics device or not. VNC will not be available if checked.',
          )}
          descriptionData={
            <HeadLessMode
              updateHeadlessMode={(checked) => updateHeadlessMode(vm, checked)}
              vm={vm}
            />
          }
          breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
          data-test-id={`${vm?.metadata?.name}-headless`}
          descriptionHeader={t('Headless mode')}
          isPopover
        />
        <VirtualMachineDescriptionItem
          bodyContent={t(
            'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
          )}
          descriptionData={
            <Switch
              onChange={(checked) => {
                setIsCheckedGuestSystemAccessLog(checked);
                updateGuestSystemAccessLog(vm, checked);
              }}
              id="guest-system-log-access"
              isChecked={isCheckedGuestSystemAccessLog}
            />
          }
          data-test-id="guest-system-log-access"
          descriptionHeader={t('Guest system log access')}
          isPopover
        />
        <DetailsSectionHardware vm={vm} vmi={vmi} />
        <DetailsSectionBoot canUpdateVM={canUpdateVM} vm={vm} vmi={vmi} />
      </DescriptionList>
    </div>
  );
};

export default DetailsSection;
