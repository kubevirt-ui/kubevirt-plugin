import React, { useEffect, useState } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MoveVMToFolderModal from '@kubevirt-utils/components/MoveVMToFolderModal/MoveVMToFolderModal';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import {
  DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  TREE_VIEW_FOLDERS,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeatureReadOnly from '@kubevirt-utils/hooks/useFeatures/useFeatureReadOnly';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getPreferredBootmode } from '@kubevirt-utils/resources/preference/helper';
import { asAccessReview, getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION, getDevices, getHostname } from '@kubevirt-utils/resources/vm';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Switch, Title } from '@patternfly/react-core';
import DetailsSectionBoot from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionBoot';
import DetailsSectionHardware from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionHardware';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import usePreference from '../../hooks/usePreference';

const CustomizeInstanceTypeDetailsTab = () => {
  const vm = vmSignal.value;

  const [preference, preferenceLoading] = usePreference(vm);

  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});

  const { featureEnabled: isGuestSystemLogsDisabled } = useFeatureReadOnly(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );
  const { featureEnabled: treeViewFoldersEnabled } = useFeatureReadOnly(TREE_VIEW_FOLDERS);

  const logSerialConsole = vm?.spec?.template?.spec?.domain?.devices?.logSerialConsole;
  const [isCheckedGuestSystemAccessLog, setIsCheckedGuestSystemAccessLog] = useState<boolean>();

  useEffect(
    () =>
      setIsCheckedGuestSystemAccessLog(
        logSerialConsole || (logSerialConsole === undefined && !isGuestSystemLogsDisabled),
      ),
    [isGuestSystemLogsDisabled, logSerialConsole],
  );

  const vmName = getName(vm);

  if (!vm || preferenceLoading) {
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
                    onSubmit={(description) =>
                      Promise.resolve(
                        updateCustomizeInstanceType([
                          {
                            data: description,
                            path: `metadata.annotations.${DESCRIPTION_ANNOTATION}`,
                          },
                        ]),
                      )
                    }
                    isOpen={isOpen}
                    obj={vm}
                    onClose={onClose}
                  />
                ))
              }
              data-test-id={`${vmName}-description`}
              descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
              isEdit
            />
            {treeViewFoldersEnabled && (
              <VirtualMachineDescriptionItem
                onEditClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <MoveVMToFolderModal
                      onSubmit={(folderName) =>
                        Promise.resolve(
                          updateCustomizeInstanceType([
                            {
                              data: folderName,
                              path: ['metadata', 'labels', VM_FOLDER_LABEL],
                            },
                          ]),
                        )
                      }
                      isOpen={isOpen}
                      onClose={onClose}
                      vm={vm}
                    />
                  ))
                }
                data-test-id={`${vmName}-folder`}
                descriptionData={getLabel(vm, VM_FOLDER_LABEL)}
                descriptionHeader={<SearchItem id="folder">{t('Folder')}</SearchItem>}
                isEdit
              />
            )}
            <VirtualMachineDescriptionItem
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <HostnameModal
                    onSubmit={(updatedVM) =>
                      Promise.resolve(
                        updateCustomizeInstanceType([
                          {
                            data: getHostname(updatedVM),
                            path: `spec.template.spec.hostname`,
                          },
                        ]),
                      )
                    }
                    isOpen={isOpen}
                    onClose={onClose}
                    vm={vm}
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
                  updateHeadlessMode={(checked) => {
                    return Promise.resolve(
                      updateCustomizeInstanceType([
                        {
                          data: checked ? false : null,
                          path: `spec.template.spec.domain.devices.autoattachGraphicsDevice`,
                        },
                      ]),
                    );
                  }}
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
                    updateCustomizeInstanceType([
                      {
                        data: checked,
                        path: `spec.template.spec.domain.devices.logSerialConsole`,
                      },
                    ]);
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
            <DetailsSectionHardware
              onSubmit={(type: HARDWARE_DEVICE_TYPE, updatedVM: V1VirtualMachine) =>
                Promise.resolve(
                  updateCustomizeInstanceType([
                    {
                      data: getDevices(updatedVM)?.[type],
                      path: `spec.template.spec.domain.devices.${type}`,
                    },
                  ]),
                )
              }
              vm={vm}
            />
            <DetailsSectionBoot
              canUpdateVM={canUpdateVM}
              isCustomizeInstanceType
              preferredBootmode={getPreferredBootmode(preference)}
              vm={vm}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default CustomizeInstanceTypeDetailsTab;
