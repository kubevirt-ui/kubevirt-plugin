import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/SSHSecretModal';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { DescriptionList } from '@patternfly/react-core';

const DetailsRightGrid: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { vmNamespaceTarget, instanceTypeVMState, setInstanceTypeVMState, activeNamespace } =
    useInstanceTypeVMStore();
  const { pvcSource, sshSecretCredentials } = instanceTypeVMState;

  const pvcDiskSize = pvcSource?.spec?.resources?.requests?.storage;
  const sizeData = formatBytes(pvcDiskSize);

  const setSSHCredentials = (credentials: SSHSecretDetails) => {
    setInstanceTypeVMState({
      type: instanceTypeActionType.setSSHCredentials,
      payload: credentials,
    });

    return Promise.resolve();
  };

  return (
    <DescriptionList isHorizontal>
      <VirtualMachineDescriptionItem
        descriptionData={vmNamespaceTarget}
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
        descriptionData={sshSecretCredentials?.sshSecretName || t('Not configured')}
        descriptionHeader={t('SSH key name')}
        isEdit
        onEditClick={() =>
          createModal((modalProps) => (
            <SSHSecretModal
              {...modalProps}
              initialSSHSecretDetails={sshSecretCredentials}
              onSubmit={setSSHCredentials}
              namespace={activeNamespace}
            />
          ))
        }
      />
    </DescriptionList>
  );
};

export default DetailsRightGrid;
