import React, { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCluster from '@multicluster/hooks/useCluster';
import { getVMWizardURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

import { NoVMsAlertProps } from './utils';

const NoVMsAlert: FC<NoVMsAlertProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const [dismissed, setDismissed] = useState(false);
  const isACMPage = useIsACMPage();
  const cluster = useCluster();

  const vmWizardURL = useMemo(
    () => getVMWizardURL(isACMPage ? cluster || '' : '', namespace || DEFAULT_NAMESPACE),
    [isACMPage, cluster, namespace],
  );

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      actionClose={<AlertActionCloseButton onClose={() => setDismissed(true)} />}
      isInline
      title={t('No data to display yet.')}
      variant={AlertVariant.info}
    >
      {t('Create your first virtual machine to begin monitoring health and performance metrics.')}
      <br />
      <Link to={vmWizardURL}>{t('Create VM')}</Link>
    </Alert>
  );
};

export default NoVMsAlert;
