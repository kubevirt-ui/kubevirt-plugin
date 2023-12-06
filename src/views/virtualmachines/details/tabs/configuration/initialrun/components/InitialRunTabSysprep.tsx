import React, { FC } from 'react';
import { getSyspredConfigMapName } from 'src/views/templates/details/tabs/scripts/components/SysPrepItem/sysprep-utils';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import WindowsLabel from '@kubevirt-utils/components/Labels/WindowsLabel';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { AUTOUNATTEND, UNATTEND } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepDescription } from '@kubevirt-utils/components/SysprepModal/SysprepDescription';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type InitialRunTabSysprepProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
};
const InitialRunTabSysprep: FC<InitialRunTabSysprepProps> = ({ canUpdateVM, vm }) => {
  const vmVolumes = getVolumes(vm);
  const currentSysprepVolume = vmVolumes?.find(getSyspredConfigMapName);
  const currentVMSysprepName = getSyspredConfigMapName(currentSysprepVolume);

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

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        <SysprepDescription
          error={sysprepLoadError}
          hasAutoUnattend={!!autoUnattend}
          hasUnattend={!!unattend}
          loaded={sysprepLoaded}
          selectedSysprepName={currentVMSysprepName}
        />
      }
      data-test-id="sysprep-button"
      descriptionHeader={<SearchItem id="sysprep">{t('Sysprep')}</SearchItem>}
      isDisabled
      isEdit={canUpdateVM}
      label={<WindowsLabel />}
      showEditOnTitle
    />
  );
};
export default InitialRunTabSysprep;
