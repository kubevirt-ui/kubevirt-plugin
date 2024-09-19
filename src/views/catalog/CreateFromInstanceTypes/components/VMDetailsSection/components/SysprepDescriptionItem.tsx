import React, { FC, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeVMInitialState } from '@catalog/CreateFromInstanceTypes/state/utils/state';
import {
  instanceTypeActionType,
  SysprepConfigMapData,
} from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import useSysprepConfigMaps from '@kubevirt-utils/components/SysprepModal/hooks/useConfigMaps';
import {
  AUTOUNATTEND,
  generateSysprepConfigMapName,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-utils/models';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Loading } from '@patternfly/quickstarts';

const SysprepDescriptionItem: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { instanceTypeVMState, isChangingNamespace, setInstanceTypeVMState, vmNamespaceTarget } =
    useInstanceTypeVMStore();

  const [sysprepConfigMaps] = useSysprepConfigMaps(vmNamespaceTarget);
  const sysprepInitialData = instanceTypeVMInitialState.sysprepConfigMapData;
  const { sysprepConfigMapData } = instanceTypeVMState;
  const {
    data,
    name: currentSysprepName,
    shouldCreateNewConfigMap,
  } = sysprepConfigMapData || sysprepInitialData;
  const [autounattend, setAutounattend] = useState<string>(data?.autounattend || '');
  const [unattended, setUnattended] = useState<string>(data?.unattended || '');

  const setSysprepConfigMapData = (newConfigMapData: SysprepConfigMapData) => {
    setInstanceTypeVMState({
      payload: newConfigMapData,
      type: instanceTypeActionType.setSysprepConfigMapData,
    });

    setInstanceTypeVMState({
      payload: initialSSHCredentials,
      type: instanceTypeActionType.setSSHCredentials,
    });
  };

  const onSysprepCreation = (unattend: string, autoUnattend: string): Promise<void> => {
    if (!unattend && !autoUnattend) {
      setAutounattend('');
      setUnattended('');
      setSysprepConfigMapData(sysprepInitialData);
      return;
    }

    setAutounattend(autoUnattend);
    setUnattended(unattend);
    setSysprepConfigMapData({
      data: {
        autounattend: autoUnattend,
        unattended: unattend,
      },
      name: generateSysprepConfigMapName(),
      shouldCreateNewConfigMap: true,
    });
  };

  const onSysprepSelected = (name: string) => {
    const dataObj = sysprepConfigMaps?.filter((configMap) => configMap.metadata.name === name)[0]
      ?.data;
    const { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend } = dataObj || {};

    setAutounattend(autoUnattend);
    setUnattended(unattend);
    setSysprepConfigMapData({
      data: {
        autounattend: autoUnattend,
        unattended: unattend,
      },
      name,
      shouldCreateNewConfigMap: false,
    });
  };

  const sysprepDescription =
    autounattend || unattended ? (
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
        linkTo={false}
        name={currentSysprepName}
      />
    ) : (
      t('Not configured')
    );

  return (
    <VirtualMachineDescriptionItem
      onEditClick={() =>
        createModal((modalProps) => (
          <SysprepModal
            {...modalProps}
            autoUnattend={autounattend}
            namespace={vmNamespaceTarget}
            onSysprepCreation={onSysprepCreation}
            onSysprepSelected={onSysprepSelected}
            shouldCreateConfigMap={shouldCreateNewConfigMap}
            sysprepSelected={currentSysprepName}
            unattend={unattended}
          />
        ))
      }
      descriptionData={isChangingNamespace ? <Loading /> : sysprepDescription}
      descriptionHeader={t('Sysprep')}
      isEdit={!isChangingNamespace}
    />
  );
};

export default SysprepDescriptionItem;
