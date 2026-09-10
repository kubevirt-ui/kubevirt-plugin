import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import type { ConfirmAction } from './constants';
import { CONFIRM_ACTIONS, getActionMessages, getActionMessagesWithNamespace } from './constants';

type ConfirmActionMessageProps = {
  action?: ConfirmAction;
  obj: K8sResourceCommon;
};

const ConfirmActionMessage: FC<ConfirmActionMessageProps> = ({
  action = CONFIRM_ACTIONS.delete,
  obj,
}) => {
  const { t } = useKubevirtTranslation();
  const name = getName(obj);
  const namespace = getNamespace(obj);

  return namespace
    ? getActionMessagesWithNamespace[action](t, name, namespace)
    : getActionMessages[action](t, name);
};

export default ConfirmActionMessage;
