import React, { FC, useState } from 'react';

import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { installOrRemoveCheckupsStoragePermissions } from '../utils/utils';

import './CheckupsStorageListEmptyState.scss';

type CheckupsStorageListEmptyStateProps = {
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding;
  isPermitted: boolean;
  isPermittedToInstall: boolean;
  loadingPermissions: boolean;
};

const CheckupsStorageListEmptyState: FC<CheckupsStorageListEmptyStateProps> = ({
  clusterRoleBinding,
  isPermitted,
  isPermittedToInstall,
  loadingPermissions,
}) => {
  const { t } = useKubevirtTranslation();
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();
  const [isLoading, setIsLoading] = useState<boolean>();

  return (
    <EmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText={<>{t('No storage checkups found')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {isPermitted
          ? t('To get started, run a storage checkup')
          : t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            isDisabled={
              isLoading ||
              loadingPermissions ||
              namespace === ALL_NAMESPACES_SESSION_KEY ||
              !isPermittedToInstall
            }
            onClick={async () => {
              setIsLoading(true);
              try {
                await installOrRemoveCheckupsStoragePermissions(
                  namespace,
                  cluster,
                  isPermitted,
                  clusterRoleBinding,
                );
              } finally {
                setIsLoading(false);
              }
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
            text={t('Learn more about storage checkups')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsStorageListEmptyState;
