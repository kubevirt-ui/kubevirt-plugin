import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import AckConfirmationModal from '@kubevirt-utils/components/AckConfirmationModal/AckConfirmationModal';
import { VMActionTelemetry } from '@kubevirt-utils/extensions/telemetry';
import { logVMBulkActionPerformed } from '@kubevirt-utils/extensions/telemetry/vm-actions';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import { getVMNamesByNamespace } from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/utils/utils';

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

  const actionOnVms = async (): Promise<void> => {
    const results = await Promise.allSettled(vms?.map((vm) => action(vm)) ?? []);

    if (numVMs) {
      logVMBulkActionPerformed(actionType as VMActionTelemetry, numVMs);
    }

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (failures.length === 0) {
      return;
    }

    failures.forEach((failure) =>
      kubevirtConsole.error(`Failed to ${actionType.toLowerCase()}:`, failure.reason),
    );
    throw new Error(
      `Failed to ${actionType.toLowerCase()} for ${failures.length} of ${
        vms?.length ?? 0
      } VirtualMachine(s)`,
    );
  };

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
    <AckConfirmationModal
      action={actionOnVms}
      actionLabel={t(actionType)}
      actionType={actionType}
      checkToConfirmMessage={checkToConfirmMessage}
      isOpen={isOpen}
      onClose={onClose}
      severityVariant={severityVariant}
      title={title}
    >
      {body}
    </AckConfirmationModal>
  );
};

export default ConfirmMultipleVMActionsModal;
