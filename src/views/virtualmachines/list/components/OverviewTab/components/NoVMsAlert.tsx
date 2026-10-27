import { type FC, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { getVMWizardURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, AlertVariant, Skeleton } from '@patternfly/react-core';

import { getAlertMessage } from './utils';

type NoVMsAlertProps = { cluster?: string; namespace?: string };

const NoVMsAlert: FC<NoVMsAlertProps> = ({ cluster, namespace }) => {
  const { t } = useKubevirtTranslation();
  const [dismissed, setDismissed] = useState(false);
  const isACMPage = useIsACMPage();
  const isAllProjectsScope = isAllNamespaces(namespace);

  const [canCreateVMInProject, loading] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: namespace ?? DEFAULT_NAMESPACE,
    resource: VirtualMachineModel.plural,
    verb: 'create',
  });

  const canCreateVM = isAllProjectsScope || canCreateVMInProject;

  const vmWizardURL = useMemo(() => getVMWizardURL(isACMPage), [isACMPage]);

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
      {loading && !isAllProjectsScope ? (
        <Skeleton screenreaderText={t('Loading')} width="75%" />
      ) : (
        <>
          {alertMessage}
          {canCreateVM && (
            <div className="pf-v6-u-mt-sm">
              <Link state={{ cluster, namespace }} to={vmWizardURL}>
                {t('Create VM')}
              </Link>
            </div>
          )}
        </>
      )}
    </Alert>
  );
};

export default NoVMsAlert;
