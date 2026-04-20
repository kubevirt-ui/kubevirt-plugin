import React, { FCC, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCluster from '@multicluster/hooks/useCluster';
import { getVMWizardURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, AlertVariant, Skeleton } from '@patternfly/react-core';

import { getAlertMessage } from './utils';

type NoVMsAlertProps = { namespace?: string };

const NoVMsAlert: FCC<NoVMsAlertProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const [dismissed, setDismissed] = useState(false);
  const isACMPage = useIsACMPage();
  const cluster = useCluster();
  const selectedNamespace = namespace || DEFAULT_NAMESPACE;

  const [canCreateVM, loading] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: selectedNamespace,
    resource: VirtualMachineModel.plural,
    verb: 'create',
  });

  const vmWizardURL = useMemo(
    () => getVMWizardURL(isACMPage ? cluster || '' : ''),
    [isACMPage, cluster],
  );

  const alertMessage = getAlertMessage(canCreateVM, t);

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
      {loading ? (
        <Skeleton screenreaderText={t('Loading')} width="75%" />
      ) : (
        <>
          {alertMessage}
          {canCreateVM && (
            <div className="pf-v6-u-mt-sm">
              <Link to={vmWizardURL}>{t('Create VM')}</Link>
            </div>
          )}
        </>
      )}
    </Alert>
  );
};

export default NoVMsAlert;
