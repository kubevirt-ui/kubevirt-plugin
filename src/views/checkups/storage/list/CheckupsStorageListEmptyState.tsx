import React, { FC, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { StorageDomainIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { installOrRemoveCheckupsStoragePermissions } from '../utils/utils';

import './CheckupsStorageListEmptyState.scss';

type CheckupsStorageListEmptyStateProps = {
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding;
  isPermitted: boolean;
  loadingPermissions: boolean;
};

const CheckupsStorageListEmptyState: FC<CheckupsStorageListEmptyStateProps> = ({
  clusterRoleBinding,
  isPermitted,
  loadingPermissions,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>(loadingPermissions);

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        headingLevel="h4"
        icon={<EmptyStateIcon icon={StorageDomainIcon} />}
        titleText={<>{t('No storage checkups found')}</>}
      />

      <EmptyStateBody>
        {t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            isDisabled={!isPermitted || isLoading || namespace === ALL_NAMESPACES_SESSION_KEY}
            onClick={() => navigate(createURL('form', location.pathname))}
          >
            {t('Run checkup')}
          </Button>
        </EmptyStateActions>
        <EmptyStateActions>
          <Button
            onClick={async () => {
              setIsLoading(true);
              try {
                await installOrRemoveCheckupsStoragePermissions(
                  namespace,
                  isPermitted,
                  clusterRoleBinding,
                );
              } finally {
                setIsLoading(false);
              }
            }}
            isDisabled={isLoading || namespace === ALL_NAMESPACES_SESSION_KEY}
            isLoading={isLoading}
            variant={isLoading ? ButtonVariant.plain : ButtonVariant.secondary}
          >
            {!isLoading && isPermitted ? t('Remove permissions') : t('Install permissions')}
          </Button>
        </EmptyStateActions>
        <EmptyStateActions className="empty-state-secondary-action">
          <ExternalLink href={'#'} text={t('Learn more about storage checkups')} />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsStorageListEmptyState;
