import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { StorageDomainIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { installOrRemoveCheckupsStoragePermissions } from '../utils/utils';

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
  const history = useHistory();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>(loadingPermissions);

  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <EmptyStateIcon icon={StorageDomainIcon} />
      <Title headingLevel="h4" size="lg">
        {t('No network latency checkups yet')}
      </Title>
      <EmptyStateBody>
        {t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>
      <EmptyStatePrimary>
        <Button
          isDisabled={!isPermitted || isLoading || namespace === ALL_NAMESPACES_SESSION_KEY}
          onClick={() => history.push(createURL('form', history.location.pathname))}
        >
          {t('Run checkup')}
        </Button>
      </EmptyStatePrimary>
      <EmptyStateSecondaryActions>
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
      </EmptyStateSecondaryActions>
      <EmptyStateSecondaryActions>
        <ExternalLink href={'#'} text={t('Learn about network checkups')} />
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default CheckupsStorageListEmptyState;
