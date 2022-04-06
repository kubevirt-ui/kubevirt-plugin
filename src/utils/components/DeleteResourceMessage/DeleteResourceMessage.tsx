import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const DeleteResourceMessage: React.FC<{ obj: K8sResourceCommon }> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Trans t={t}>
      Are you sure you want to delete <strong>{obj.metadata.name} </strong>in namespace{' '}
      <strong>{obj.metadata.namespace}?</strong>
    </Trans>
  );
};

export default DeleteResourceMessage;
