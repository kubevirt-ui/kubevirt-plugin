import React, { FC, useEffect, useMemo, useState } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { INSTANCETYPE_CLASS_DISPLAY_NAME } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import InstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/InstanceTypeModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeatureReadOnly from '@kubevirt-utils/hooks/useFeatures/useFeatureReadOnly';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { asAccessReview, getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import {
  DESCRIPTION_ANNOTATION,
  getCPU,
  getInstanceTypeMatcher,
  getMachineType,
  getWorkload,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Switch, Title } from '@patternfly/react-core';
import DeletionProtectionModal from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/DeletionProtectionModal';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

import DetailsSectionBoot from './components/DetailsSectionBoot';
import DetailsSectionHardware from './components/DetailsSectionHardware';
import {
  updateDescription,
  updatedHostname,
  updatedInstanceType,
  updatedVirtualMachine,
  updateGuestSystemAccessLog,
  updateHeadlessMode,
  updateWorkload,
} from './utils/utils';

import './details-section.scss';

type DetailsSectionProps = {
  allInstanceTypes: InstanceTypeUnion[];
  instanceTypeVM: V1VirtualMachine;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const DetailsSection: FC<DetailsSectionProps> = ({ allInstanceTypes, instanceTypeVM, vm, vmi }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const { featureEnabled: isGuestSystemLogsDisabled } = useFeatureReadOnly(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const logSerialConsole = vm?.spec?.template?.spec?.domain?.devices?.logSerialConsole;
  const [isCheckedGuestSystemAccessLog, setIsCheckedGuestSystemAccessLog] = useState<boolean>();
  const instanceType = useMemo(
    () => allInstanceTypes.find((it) => it.metadata.name === vm?.spec?.instancetype?.name),
    [allInstanceTypes, vm?.spec?.instancetype?.name],
  );
  useEffect(
    () =>
      setIsCheckedGuestSystemAccessLog(
        logSerialConsole || (logSerialConsole === undefined && !isGuestSystemLogsDisabled),
      ),
    [isGuestSystemLogsDisabled, logSerialConsole],
  );

  const vmWorkload = getWorkload(vm);
  const vmName = getName(vm);

  const cpuMemoryVM = instanceTypeVM?.metadata?.uid === vm?.metadata?.uid ? instanceTypeVM : vm;

  const isInstanceType = isInstanceTypeVM(vm);
  const deletionProtectionEnabled = isDeletionProtectionEnabled(vm);

  const loadingInstanceType = isInstanceType && isEmpty(instanceType);

  if (!vm || loadingInstanceType) {
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
              descriptionHeader={
                <SearchItem id="cpu-memory">
                  {isInstanceType ? t('InstanceType') : t('CPU | Memory')}
                </SearchItem>
              }
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => {
                  return isInstanceType ? (
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
                  );
                })
              }
              subTitle={
                instanceType && getAnnotation(instanceType, INSTANCETYPE_CLASS_DISPLAY_NAME)
              }
              bodyContent={isInstanceType ? null : <CPUDescription cpu={getCPU(vm)} />}
              data-test-id={`${vmName}-cpu-memory`}
              descriptionData={<CPUMemory vm={cpuMemoryVM || vm} vmi={vmi} />}
              isEdit={canUpdateVM}
              isPopover
            />
            <VirtualMachineDescriptionItem
              bodyContent={t('The QEMU machine type.')}
              descriptionData={getMachineType(vm) || NO_DATA_DASH}
              descriptionHeader={t('Machine type')}
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
                  onChange={(_event, checked) => {
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
            <VirtualMachineDescriptionItem
              bodyContent={t(
                'Applying deletion protection to this VM will prevent deletion through the web console.',
              )}
              descriptionData={
                <Switch
                  onChange={(_event, checked) =>
                    createModal(({ isOpen, onClose }) =>
                      checked ? (
                        <DeletionProtectionModal
                          deletionProtectionOption={VMDeletionProtectionOptions.ENABLE}
                          isOpen={isOpen}
                          onClose={onClose}
                          vm={vm}
                        />
                      ) : (
                        <DeletionProtectionModal
                          deletionProtectionOption={VMDeletionProtectionOptions.DISABLE}
                          isOpen={isOpen}
                          onClose={onClose}
                          vm={vm}
                        />
                      ),
                    )
                  }
                  id="deletion-protection"
                  isChecked={deletionProtectionEnabled}
                />
              }
              descriptionHeader={
                <SearchItem id="deletion-protection">{t('Deletion protection')}</SearchItem>
              }
              data-test-id="deletion-protection"
              isPopover
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={5}>
          <DescriptionList>
            <DetailsSectionHardware vm={vm} vmi={vmi} />
            <DetailsSectionBoot
              canUpdateVM={canUpdateVM}
              instanceTypeVM={instanceTypeVM}
              vm={vm}
              vmi={vmi}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default DetailsSection;
