import React, { FC } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { usePVCOwnerVMName } from './hooks/usePVCOwnerVMName';

type PVCOwnerWarningProps = {
  cluster?: string;
  namespace: string;
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
};

const PVCOwnerWarning: FC<PVCOwnerWarningProps> = ({ cluster, namespace, pvc }) => {
  const { t } = useKubevirtTranslation();
  const vmOwnerName = usePVCOwnerVMName(pvc, namespace, cluster);

  if (!vmOwnerName) return null;

  return (
    <Alert
      title={t(
        'This disk is owned by VirtualMachine {{vmOwnerName}}. If that VirtualMachine is deleted, this disk will also be deleted.',
        { vmOwnerName },
      )}
      className="pf-v6-u-mt-sm"
      data-test="pvc-owner-warning"
      isInline
      isPlain
      variant={AlertVariant.warning}
    />
  );
};

export default PVCOwnerWarning;
