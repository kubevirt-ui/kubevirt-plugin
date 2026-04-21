import React, { FC, useState } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
  ResourceQuotaModel,
} from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';

import { getStandardResourceQuotaListURL } from '../utils/url';

type StandardResourceQuotaAlertProps = {
  className?: string;
  namespace: string;
};

const StandardResourceQuotaAlert: FC<StandardResourceQuotaAlertProps> = ({
  className,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  const [isAlertOpen, setIsAlertOpen] = useState(true);

  const [resourceQuotas, loaded, error] = useKubevirtWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ResourceQuotaModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const nonAAQManagedResourceQuotas = resourceQuotas.filter(
    (quota) =>
      !quota.metadata?.ownerReferences?.some(
        (ownerRef) => ownerRef.kind === ApplicationAwareResourceQuotaModel.kind,
      ),
  );

  if (!isAlertOpen || !loaded || error || isEmpty(nonAAQManagedResourceQuotas)) {
    return null;
  }

  return (
    <Alert
      actionLinks={
        <ExternalLink
          href={getStandardResourceQuotaListURL(namespace)}
          text={t('View ResourceQuotas for this project')}
        />
      }
      actionClose={<AlertActionCloseButton onClose={() => setIsAlertOpen(false)} />}
      className={className}
      isInline
      title={t('Standard ResourceQuota detected on project')}
      variant="warning"
    >
      <p>
        {t(
          'This project is also governed by a ResourceQuota. Review to ensure accurate and consistent resource enforcement.',
        )}
      </p>
    </Alert>
  );
};

export default StandardResourceQuotaAlert;
