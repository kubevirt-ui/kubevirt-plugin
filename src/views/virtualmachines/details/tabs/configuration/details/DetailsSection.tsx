import React, { FC, useEffect, useState } from 'react';

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
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import {
  DESCRIPTION_ANNOTATION,
  getCPU,
  getInstanceTypeMatcher,
  getWorkload,
} from '@kubevirt-utils/resources/vm';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Switch, Title } from '@patternfly/react-core';

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
  const { featureEnabled: isGuestSystemLogsDisabled } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const logSerialConsole = (
    vm?.spec?.template?.spec?.domain?.devices as V1Devices & { logSerialConsole: boolean }
  )?.logSerialConsole;
  const [isCheckedGuestSystemAccessLog, setIsCheckedGuestSystemAccessLog] = useState<boolean>();

  useEffect(
    () =>
      setIsCheckedGuestSystemAccessLog(
        logSerialConsole || (logSerialConsole === undefined && !isGuestSystemLogsDisabled),
      ),
    [isGuestSystemLogsDisabled, logSerialConsole],
  );

  const vmWorkload = getWorkload(vm);
  const vmName = getName(vm);

  if (!vm) {
    return <Loading />;
  }

  return (
    <div className="VirtualMachinesDetailsSection">
      <Title headingLevel="h2">
        <SearchItem id="details">{t('VirtualMachine details')}</SearchItem>
      </Title>
      <Grid>
        <GridItem span={5}>
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
              data-test-id={`${vmName}-description`}
              descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
              isEdit
            />
            {!getInstanceTypeMatcher(vm) && (
              <VirtualMachineDescriptionItem
                descriptionData={
                  vmWorkload ? (
                    WORKLOADS_LABELS[vmWorkload] || vmWorkload
                  ) : (
                    <MutedTextSpan text={t('Not available')} />
                  )
                }
                descriptionHeader={
                  <SearchItem id="workload-profile">{t('Workload profile')}</SearchItem>
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
                data-test-id={`${vmName}-workload-profile`}
                isEdit
              />
            )}
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
              data-test-id={`${vmName}-cpu-memory`}
              descriptionData={<CPUMemory vm={vm} />}
              descriptionHeader={<SearchItem id="cpu-memory">{t('CPU | Memory')}</SearchItem>}
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
              data-test-id={`${vmName}-hostname`}
              descriptionData={vm?.spec?.template?.spec?.hostname || vmName}
              descriptionHeader={<SearchItem id="hostname">{t('Hostname')}</SearchItem>}
              isEdit
            />
            <VirtualMachineDescriptionItem
              bodyContent={t(
                'Whether to attach the default graphics device or not. VNC will not be available if checked.',
              )}
              descriptionData={
                <HeadlessMode
                  updateHeadlessMode={(checked) => updateHeadlessMode(vm, checked)}
                  vm={vm}
                />
              }
              breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
              data-test-id={`${vmName}-headless`}
              descriptionHeader={<SearchItem id="headless-mode">{t('Headless mode')}</SearchItem>}
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
                  isDisabled={isGuestSystemLogsDisabled}
                />
              }
              descriptionHeader={
                <SearchItem id="guest-system-log-access">{t('Guest system log access')}</SearchItem>
              }
              data-test-id="guest-system-log-access"
              isPopover
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={5}>
          <DescriptionList>
            <DetailsSectionHardware vm={vm} vmi={vmi} />
            <DetailsSectionBoot canUpdateVM={canUpdateVM} vm={vm} vmi={vmi} />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default DetailsSection;
