import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { useIsWindowsBootableVolume } from '@catalog/CreateFromInstanceTypes/utils/utils';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { DescriptionList } from '@patternfly/react-core';

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
  const pvcDiskSize = pvcSource?.spec?.resources?.requests?.storage;
  const sizeData = formatBytes(pvcDiskSize);

  const setSSHCredentials = (credentials: SSHSecretDetails) => {
    setInstanceTypeVMState({
      payload: { ...credentials, appliedDefaultKey: sshSecretCredentials?.appliedDefaultKey },
      type: instanceTypeActionType.setSSHCredentials,
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
        descriptionData={pvcDiskSize && sizeData}
        descriptionHeader={t('Boot disk size')}
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
            descriptionHeader={t('Public SSH key')}
            isEdit={!isChangingNamespace}
          />
          <DynamicSSHKeyInjectionInstanceType />
        </>
      )}
    </DescriptionList>
  );
};

export default DetailsRightGrid;
