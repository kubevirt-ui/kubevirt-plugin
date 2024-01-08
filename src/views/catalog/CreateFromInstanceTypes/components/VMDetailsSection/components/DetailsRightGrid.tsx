import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Select, SelectOption } from '@patternfly/react-core';

import DynamicSSHKeyInjectionIntanceType from './DynamicSSHKeyInjectionIntanceType';

import './details-right-grid.scss';

const DetailsRightGrid: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isOpenStorageClass, setIsOpenStorageClass] = useState<boolean>(false);
  const [storageClasses] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

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
  const sortedStorageClasses = useMemo(
    () => storageClasses?.map((sc) => sc?.metadata?.name)?.sort(),
    [storageClasses],
  );

  const setSSHCredentials = (credentials: SSHSecretDetails) => {
    setInstanceTypeVMState({
      payload: { ...credentials, appliedDefaultKey: sshSecretCredentials?.appliedDefaultKey },
      type: instanceTypeActionType.setSSHCredentials,
    });

    return Promise.resolve();
  };

  return (
    <DescriptionList isHorizontal>
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
          <Select
            onSelect={(_: MouseEvent, value: string) => {
              setSelectedStorageClass(value);
              setIsOpenStorageClass(false);
            }}
            selections={
              instanceTypeVMState.selectedStorageClass || pvcSource?.spec?.storageClassName
            }
            className="storageclass-select__dropdown"
            hasInlineFilter
            isOpen={isOpenStorageClass}
            onToggle={setIsOpenStorageClass}
          >
            {sortedStorageClasses?.map((name) => (
              <SelectOption key={name} value={name} />
            ))}
          </Select>
        }
        descriptionHeader={t('Storage class')}
      />
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
      <DynamicSSHKeyInjectionIntanceType />
    </DescriptionList>
  );
};

export default DetailsRightGrid;
