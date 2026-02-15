import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
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
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { UpdateCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { createSysprepConfigMap, patchVMWithExistingSysprepConfigMap } from '../utils/utils';

type InitialRunTabSysprepProps = {
  canUpdateVM: boolean;
  onSubmit?: UpdateCustomizeInstanceType;
  vm: V1VirtualMachine;
};
const InitialRunTabSysprep: FC<InitialRunTabSysprepProps> = ({ canUpdateVM, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmVolumes = getVolumes(vm);
  const cluster = getCluster(vm);

  const currentSysprepVolume = vmVolumes?.find(getSysprepConfigMapName);
  const currentVMSysprepName = getSysprepConfigMapName(currentSysprepVolume);

  const sysprepSelected = !isEmpty(currentVMSysprepName) && currentVMSysprepName;
  const [externalSysprepConfig, sysprepLoaded, sysprepLoadError] =
    useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
      sysprepSelected && {
        cluster,
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
    <DescriptionItem
      descriptionData={
        <SysprepDescription
          cluster={cluster}
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
