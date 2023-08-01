import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { DescriptionList } from '@patternfly/react-core';

import DynamicSSHKeyInjectionIntanceType from './DynamicSSHKeyInjectionIntanceType';

const DetailsRightGrid: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { instanceTypeVMState, isChangingNamespace, setInstanceTypeVMState, vmNamespaceTarget } =
    useInstanceTypeVMStore();
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
        descriptionData={pvcSource?.spec?.storageClassName}
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
        descriptionHeader={t('SSH key name')}
        isEdit={!isChangingNamespace}
      />
      <DynamicSSHKeyInjectionIntanceType />
    </DescriptionList>
  );
};

export default DetailsRightGrid;
