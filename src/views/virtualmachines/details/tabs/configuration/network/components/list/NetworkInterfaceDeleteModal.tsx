import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { Alert, AlertVariant } from '@patternfly/react-core';
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
  const namespace = getNamespace(vm);

  return (
    <DeleteModal
      body={
        <>
          {isRunning(vm) && isHotPlugNIC && (
            <Alert
              className="pf-v6-u-mb-md"
              component={'h6'}
              isInline
              title={t(
                'Deleting a network interface is supported only on VirtualMachines that were created in versions greater than 4.13.',
              )}
              variant={AlertVariant.warning}
            />
          )}
          <ConfirmActionMessage obj={{ metadata: { name: nicName, namespace } }} />
        </>
      }
      headerText={t('Delete NIC?')}
      isOpen={isOpen}
      obj={vm}
      onClose={onClose}
      onDeleteSubmit={() => deleteNetworkInterface(vm, nicName, nicPresentation)}
      shouldRedirect={false}
    />
  );
};

export default NetworkInterfaceDeleteModal;
