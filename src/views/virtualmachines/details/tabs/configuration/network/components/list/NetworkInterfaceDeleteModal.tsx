import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { Alert, AlertVariant, ButtonVariant } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

type NetworkInterfaceDeleteModalProps = {
  isHotPlugNIC: boolean;
  isOpen: boolean;
  nicName: string;
  nicPresentation: NetworkPresentation;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const NetworkInterfaceDeleteModal: FC<NetworkInterfaceDeleteModalProps> = ({
  isHotPlugNIC,
  isOpen,
  nicName,
  nicPresentation,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const deleteBtnText = t('Delete');

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Delete NIC?')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => deleteNetworkInterface(vm, nicName, nicPresentation)}
      submitBtnText={deleteBtnText}
      submitBtnVariant={ButtonVariant.danger}
    >
      <span>
        {isRunning(vm) && isHotPlugNIC && (
          <Alert
            component={'h6'}
            isInline
            title={t(
              'Deleting a network interface is supported only on VirtualMachines that were created in versions greater than 4.13.',
            )}
            variant={AlertVariant.warning}
          />
        )}
        <br />
        <ConfirmActionMessage
          obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
        />
      </span>
    </TabModal>
  );
};

export default NetworkInterfaceDeleteModal;
