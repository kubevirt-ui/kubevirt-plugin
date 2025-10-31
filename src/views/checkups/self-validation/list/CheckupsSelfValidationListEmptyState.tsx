import React, { FC, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
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
  EmptyStateVariant,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { installSelfValidationPermissions, removeSelfValidationPermissions } from '../utils';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>();

  return (
    <EmptyState
      headingLevel="h4"
      icon={CheckCircleIcon}
      titleText={<>{t('No self validation checkups found')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {t('To get started, install permissions and then run a self validation checkup')}
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
            isDisabled={
              isLoading ||
              loadingPermissions ||
              namespace === ALL_NAMESPACES_SESSION_KEY ||
              !isPermittedToInstall
            }
            onClick={async () => {
              setIsLoading(true);
              try {
                if (isPermitted) {
                  await removeSelfValidationPermissions(namespace);
                } else {
                  await installSelfValidationPermissions(namespace);
                }
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
            text={t('Learn more about self validation checkups')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsSelfValidationListEmptyState;
