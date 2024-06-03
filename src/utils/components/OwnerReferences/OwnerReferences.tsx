import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForResource,
  K8sResourceCommon,
  OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';

type OwnerReferencesProps = {
  obj: K8sResourceCommon;
};

const OwnerReferences: FC<OwnerReferencesProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const ownerReferences = (obj?.metadata?.ownerReferences || [])?.map(
    (ownerRef: OwnerReference) => (
      <ResourceLink
        groupVersionKind={getGroupVersionKindForResource(ownerRef)}
        key={ownerRef?.uid}
        name={ownerRef?.name}
        namespace={obj?.metadata?.namespace}
      />
    ),
  );

  return !isEmpty(ownerReferences) ? (
    <div>{ownerReferences}</div>
  ) : (
    <span className="text-muted">{t('No owner')}</span>
  );
};

export default OwnerReferences;
