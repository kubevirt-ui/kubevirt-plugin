import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import { getVMNamesByNamespace } from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/utils/utils';

import ConfirmVMActionBaseModal from './components/ConfirmVMActionBaseModal';
import VMsCountByNamespacePopoverLink from './components/VMsCountByNamespacePopoverLink';

import './ConfirmMultipleVMActionsModal.scss';

type ConfirmMultipleVMActionsModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string | void>;
  actionType: string;
  checkToConfirmMessage?: string;
  excludedVMs?: V1VirtualMachine[];
  excludedVMsReason?: string;
  includedVMsDescription?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  vms: V1VirtualMachine[];
};

const ConfirmMultipleVMActionsModal: FC<ConfirmMultipleVMActionsModalProps> = ({
  action,
  actionType,
  checkToConfirmMessage,
  excludedVMs,
  excludedVMsReason,
  includedVMsDescription,
  isOpen,
  onClose,
  severityVariant,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const vmsByNamespace = getVMNamesByNamespace(vms);
  const numVMs = vms?.length;

  const hasExcludedVMs = !isEmpty(excludedVMs);
  const excludedVMsByNamespace = getVMNamesByNamespace(excludedVMs);
  const numExcludedVMs = excludedVMs?.length;
  const totalSelectedVMs = numVMs + (numExcludedVMs || 0);

  const actionOnVms = async () =>
    Promise.any(
      vms?.map((vm) => {
        action(vm);
      }),
    );

  const defaultBody = (
    <>
      {t('Are you sure you want to')} {t(actionType.toLowerCase())}{' '}
      <VMsCountByNamespacePopoverLink suffix="?" vmsByNamespace={vmsByNamespace} />
    </>
  );

  const bodyWithExcludedVMs = (
    <Stack hasGutter>
      <StackItem>
        <VMsCountByNamespacePopoverLink vmsByNamespace={excludedVMsByNamespace} />{' '}
        {excludedVMsReason}
      </StackItem>
      <StackItem>
        <VMsCountByNamespacePopoverLink vmsByNamespace={vmsByNamespace} /> {includedVMsDescription}
      </StackItem>
    </Stack>
  );

  const body = hasExcludedVMs ? bodyWithExcludedVMs : defaultBody;

  const title = hasExcludedVMs
    ? t('{{actionType}} {{numVMs}} of {{totalVMs}} VirtualMachines?', {
        actionType,
        numVMs,
        totalVMs: totalSelectedVMs,
      })
    : t('{{actionType}} {{numVMs}} VirtualMachines?', { actionType, numVMs });

  return (
    <ConfirmVMActionBaseModal
      {...{
        action: actionOnVms,
        actionType,
        checkToConfirmMessage,
        isOpen,
        onClose,
        severityVariant,
        title,
      }}
    >
      {body}
    </ConfirmVMActionBaseModal>
  );
};

export default ConfirmMultipleVMActionsModal;
