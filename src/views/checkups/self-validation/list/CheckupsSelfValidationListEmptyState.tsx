import React, { FC, useMemo, useState } from 'react';

import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { useAllRunningSelfValidationJobs } from '../components/hooks/useAllRunningSelfValidationJobs';
import { installSelfValidationPermissions, removeSelfValidationPermissions } from '../utils';
import { getRunningCheckupErrorMessage } from '../utils/selfValidationMessages';

import './CheckupsSelfValidationListEmptyState.scss';

type CheckupsSelfValidationListEmptyStateProps = {
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding;
  isPermitted: boolean;
  isPermittedToInstall: boolean;
  loadingPermissions: boolean;
};

const CheckupsSelfValidationListEmptyState: FC<CheckupsSelfValidationListEmptyStateProps> = ({
  clusterRoleBinding: _clusterRoleBinding,
  isPermitted,
  isPermittedToInstall,
  loadingPermissions,
}) => {
  const { t } = useKubevirtTranslation();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState<null | string>(null);
  const [runningSelfValidationJobs] = useAllRunningSelfValidationJobs();

  const hasRunningSelfValidationJobs = useMemo(
    () => runningSelfValidationJobs && runningSelfValidationJobs.length > 0,
    [runningSelfValidationJobs],
  );

  return (
    <EmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText={<>{t('No self validation checkups found')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {isPermitted
          ? t('To get started, run a self validation checkup')
          : t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>

      <EmptyStateFooter>
        {error && (
          <EmptyStateActions>
            <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
              {error}
            </Alert>
          </EmptyStateActions>
        )}
        {hasRunningSelfValidationJobs && isPermitted && (
          <EmptyStateActions>
            <Alert
              isInline
              title={t('You can only run a single self validation checkup at a time.')}
              variant={AlertVariant.danger}
            >
              {getRunningCheckupErrorMessage(t, runningSelfValidationJobs || [])}
            </Alert>
          </EmptyStateActions>
        )}
        <EmptyStateActions>
          <Button
            isDisabled={
              isLoading ||
              loadingPermissions ||
              namespace === ALL_NAMESPACES_SESSION_KEY ||
              !isPermittedToInstall
            }
            onClick={async () => {
              setError(null);
              setIsLoading(true);
              const result = isPermitted
                ? await removeSelfValidationPermissions(namespace, t)
                : await installSelfValidationPermissions(namespace, t);
              if (!result.success && result.error) {
                setError(result.error);
              }
              setIsLoading(false);
            }}
            isLoading={isLoading || loadingPermissions}
            variant={isLoading ? ButtonVariant.plain : ButtonVariant.secondary}
          >
            {!isLoading && isPermitted ? t('Remove permissions') : t('Install permissions')}
          </Button>
        </EmptyStateActions>
        <EmptyStateActions className="empty-state-secondary-action">
          <ExternalLink
            href={documentationURL.CHECKUPS}
            text={t('Learn more about self validation checkups')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsSelfValidationListEmptyState;
