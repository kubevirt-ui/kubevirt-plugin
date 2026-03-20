import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  actionMessages,
  actionMessagesWithNamespace,
  CONFIRM_ACTIONS,
  ConfirmAction,
} from './constants';

type ConfirmActionMessageProps = {
  action?: ConfirmAction;
  obj: K8sResourceCommon;
};

const ConfirmActionMessage: React.FC<ConfirmActionMessageProps> = ({
  action = CONFIRM_ACTIONS.delete,
  obj,
}) => {
  const { t } = useKubevirtTranslation();
  const name = getName(obj);
  const namespace = getNamespace(obj);

  return namespace
    ? actionMessagesWithNamespace[action]?.(t, name, namespace)
    : actionMessages[action]?.(t, name);
};

export default ConfirmActionMessage;
