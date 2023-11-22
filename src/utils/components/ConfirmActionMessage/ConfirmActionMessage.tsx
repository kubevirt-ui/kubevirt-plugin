import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ConfirmActionMessageProps = {
  action?: string;
  obj: { metadata: { name: string; namespace: string } } | K8sResourceCommon;
};

const ConfirmActionMessage: React.FC<ConfirmActionMessageProps> = ({ action = 'delete', obj }) => {
  const { t } = useKubevirtTranslation();
  const objNamespace = obj?.metadata?.namespace;

  return (
    <Trans t={t}>
      Are you sure you want to {action} <strong>{obj?.metadata?.name}</strong>
      {objNamespace && (
        <>
          {' '}
          in namespace <strong>{objNamespace}</strong>
        </>
      )}
      ?
    </Trans>
  );
};

export default ConfirmActionMessage;
