import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  actionMessages,
  actionMessagesWithNamespace,
  CONFIRM_ACTIONS,
  ConfirmAction,
} from './constants';

type ConfirmActionMessageProps = {
  action?: ConfirmAction;
  obj: { metadata: { name: string; namespace?: string } } | K8sResourceCommon;
};

const ConfirmActionMessage: React.FC<ConfirmActionMessageProps> = ({
  action = CONFIRM_ACTIONS.delete,
  obj,
}) => {
  const { t } = useKubevirtTranslation();
  const name = obj?.metadata?.name;
  const namespace = obj?.metadata?.namespace;

  return namespace
    ? actionMessagesWithNamespace[action]?.(t, name, namespace)
    : actionMessages[action]?.(t, name);
};

export default ConfirmActionMessage;
