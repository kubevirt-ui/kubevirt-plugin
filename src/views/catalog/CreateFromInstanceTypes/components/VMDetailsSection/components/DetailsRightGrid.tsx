import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { useIsWindowsBootableVolume } from '@catalog/CreateFromInstanceTypes/utils/utils';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import { initialSysprepData } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { DescriptionList } from '@patternfly/react-core';

import DiskSize from './DiskSize';
import DynamicSSHKeyInjectionInstanceType from './DynamicSSHKeyInjectionInstanceType';
import SysprepDescriptionItem from './SysprepDescriptionItem';

import './details-right-grid.scss';

const DetailsRightGrid: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [{ clusterDefaultStorageClass, sortedStorageClasses, virtDefaultStorageClass }, loaded] =
    useDefaultStorageClass();
  const isWindowsOSVolume = useIsWindowsBootableVolume();

  const {
    instanceTypeVMState,
    isChangingNamespace,
    setInstanceTypeVMState,
    setSelectedStorageClass,
    vmNamespaceTarget,
  } = useInstanceTypeVMStore();

  const { pvcSource, sshSecretCredentials } = instanceTypeVMState;

  const setSSHCredentials = (credentials: SSHSecretDetails) => {
    setInstanceTypeVMState({
      payload: { ...credentials, appliedDefaultKey: sshSecretCredentials?.appliedDefaultKey },
      type: instanceTypeActionType.setSSHCredentials,
    });

    setInstanceTypeVMState({
      payload: initialSysprepData,
      type: instanceTypeActionType.setSysprepConfigMapData,
    });

    return Promise.resolve();
  };

  return (
    <DescriptionList className="pf-c-description-list" isHorizontal>
      <VirtualMachineDescriptionItem
        descriptionData={isChangingNamespace ? <Loading /> : vmNamespaceTarget}
        descriptionHeader={t('Project')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={<DiskSize />}
        descriptionHeader={t('Disk size')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={
          loaded ? (
            <InlineFilterSelect
              selected={
                instanceTypeVMState.selectedStorageClass ||
                pvcSource?.spec?.storageClassName ||
                getName(virtDefaultStorageClass) ||
                getName(clusterDefaultStorageClass)
              }
              className="storageclass-select__dropdown"
              options={sortedStorageClasses?.map((scName) => ({ children: scName, value: scName }))}
              setSelected={setSelectedStorageClass}
              toggleProps={{ placeholder: t('Select StorageClass') }}
            />
          ) : (
            <Loading />
          )
        }
        descriptionHeader={t('Storage class')}
      />
      {isWindowsOSVolume ? (
        <SysprepDescriptionItem />
      ) : (
        <>
          <VirtualMachineDescriptionItem
            descriptionData={
              isChangingNamespace ? (
                <Loading />
              ) : (
                sshSecretCredentials?.sshSecretName || t('Not configured')
              )
            }
            onEditClick={() =>
              createModal((modalProps) => (
                <SSHSecretModal
                  {...modalProps}
                  initialSSHSecretDetails={sshSecretCredentials}
                  namespace={vmNamespaceTarget}
                  onSubmit={setSSHCredentials}
                />
              ))
            }
            descriptionHeader={<span id="tour-step-ssh">{t('Public SSH key')}</span>}
            isEdit={!isChangingNamespace}
          />
          <DynamicSSHKeyInjectionInstanceType />
        </>
      )}
    </DescriptionList>
  );
};

export default DetailsRightGrid;
