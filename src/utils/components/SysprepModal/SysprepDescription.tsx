import type { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';

export const SysprepDescription: FC<{
  cluster?: string;
  namespace?: string;
  selectedSysprepName?: string;
}> = ({ cluster, namespace, selectedSysprepName }) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(selectedSysprepName)) {
    return <span>{t('Not available')}</span>;
  }

  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
      name={selectedSysprepName}
      namespace={namespace}
    />
  );
};
