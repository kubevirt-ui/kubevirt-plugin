import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';

type OwnerReferencesProps = {
  obj: K8sResourceCommon;
};

const OwnerReferences: React.FC<OwnerReferencesProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();

  const ownerReferences = (obj?.metadata?.ownerReferences || [])?.map(
    (ownerRef: OwnerReference) => (
      <ResourceLink
        key={ownerRef?.uid}
        kind={ownerRef?.kind}
        name={ownerRef?.name}
        namespace={obj?.metadata?.namespace}
      />
    ),
  );

  return ownerReferences?.length ? (
    <div>{ownerReferences}</div>
  ) : (
    <span className="text-muted">{t('No owner')}</span>
  );
};

export default React.memo(OwnerReferences);
