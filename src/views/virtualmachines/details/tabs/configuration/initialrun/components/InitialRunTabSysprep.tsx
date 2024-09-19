import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import WindowsLabel from '@kubevirt-utils/components/Labels/WindowsLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import {
  AUTOUNATTEND,
  getSysprepConfigMapName,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepDescription } from '@kubevirt-utils/components/SysprepModal/SysprepDescription';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { UpdateCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { createSysprepConfigMap, patchVMWithExistingSysprepConfigMap } from '../utils/utils';

type InitialRunTabSysprepProps = {
  canUpdateVM: boolean;
  onSubmit?: UpdateCustomizeInstanceType;
  vm: V1VirtualMachine;
};
const InitialRunTabSysprep: FC<InitialRunTabSysprepProps> = ({ canUpdateVM, onSubmit, vm }) => {
  const { createModal } = useModal();
  const vmVolumes = getVolumes(vm);

  const currentSysprepVolume = vmVolumes?.find(getSysprepConfigMapName);
  const currentVMSysprepName = getSysprepConfigMapName(currentSysprepVolume);

  const sysprepSelected = !isEmpty(currentVMSysprepName) && currentVMSysprepName;
  const [externalSysprepConfig, sysprepLoaded, sysprepLoadError] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      sysprepSelected && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: sysprepSelected,
        namespace: vm?.metadata?.namespace,
      },
    );

  const { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend } = externalSysprepConfig?.data || {};

  const onSysprepSelected = (name: string) =>
    patchVMWithExistingSysprepConfigMap(name, vm, onSubmit);

  const onSysprepCreation = async (unattended: string, autounattend: string): Promise<void> =>
    createSysprepConfigMap(unattended, autounattend, externalSysprepConfig, vm, onSubmit);

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        <SysprepDescription
          error={sysprepLoadError}
          loaded={sysprepLoaded}
          selectedSysprepName={currentVMSysprepName}
        />
      }
      onEditClick={() =>
        createModal((modalProps) => (
          <SysprepModal
            {...modalProps}
            autoUnattend={autoUnattend}
            namespace={vm?.metadata?.namespace}
            onSysprepCreation={onSysprepCreation}
            onSysprepSelected={onSysprepSelected}
            sysprepSelected={sysprepSelected}
            unattend={unattend}
          />
        ))
      }
      data-test-id="sysprep-button"
      descriptionHeader={<SearchItem id="sysprep">{t('Sysprep')}</SearchItem>}
      isDisabled={!canUpdateVM}
      isEdit={canUpdateVM}
      label={<WindowsLabel />}
      showEditOnTitle
    />
  );
};
export default InitialRunTabSysprep;
