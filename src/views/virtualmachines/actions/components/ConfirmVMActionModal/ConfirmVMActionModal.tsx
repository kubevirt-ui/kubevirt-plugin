import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import ConfirmVMActionBaseModal from '../ConfirmMultipleVMActionsModal/components/ConfirmVMActionBaseModal';

type ConfirmVMActionModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string>;
  actionType: string;
  checkToConfirmMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  vm: V1VirtualMachine;
};

const ConfirmVMActionModal: FC<ConfirmVMActionModalProps> = ({
  action,
  actionType,
  checkToConfirmMessage,
  isOpen,
  onClose,
  severityVariant,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const body = (
    <Trans t={t}>
      Are you sure you want to {{ actionName: actionType?.toLowerCase() }} [
      <strong>{{ vmName: getName(vm) }}</strong>] in namespace [
      <strong>{{ vmNamespace: getNamespace(vm) }}</strong>]?
    </Trans>
  );

  const actionOnVm = async () => action(vm);

  return (
    <ConfirmVMActionBaseModal
      {...{
        action: actionOnVm,
        actionType,
        checkToConfirmMessage,
        isOpen,
        onClose,
        severityVariant,
        title: t('{{actionType}} VirtualMachine?', { actionType }),
      }}
    >
      {body}
    </ConfirmVMActionBaseModal>
  );
};

export default ConfirmVMActionModal;
