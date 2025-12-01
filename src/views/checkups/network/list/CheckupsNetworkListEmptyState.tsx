import React, { useState } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
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
import { SearchIcon } from '@patternfly/react-icons';

import { installOrRemoveCheckupsNetworkPermissions } from '../utils/utils';

import './checkups-network-list-empty-state.scss';

const CheckupsNetworkListEmptyState = ({ isPermitted, nadsInNamespace }) => {
  const { t } = useKubevirtTranslation();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <EmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText={<>{t('No network latency checkups found')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {isPermitted
          ? t('To get started, run a network latency checkup')
          : t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            onClick={async () => {
              setIsLoading(true);
              await installOrRemoveCheckupsNetworkPermissions(namespace, isPermitted);
              setIsLoading(false);
            }}
            isDisabled={!nadsInNamespace || isLoading}
            isLoading={isLoading}
            variant={isLoading ? ButtonVariant.plain : ButtonVariant.secondary}
          >
            {!isLoading && isPermitted ? t('Remove permissions') : t('Install permissions')}
          </Button>
        </EmptyStateActions>
        {!nadsInNamespace && (
          <p className="CheckupsNetworkListEmptyState--title__namespace pf-v6-u-text-color-subtle">
            {t('Add a NetworkAttachmentDefinition to this namespace in order to use checkups')}
          </p>
        )}
        <EmptyStateActions>
          <ExternalLink
            href={documentationURL.CHECKUPS_LATENCY}
            text={t('Learn more about network latency checkups')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsNetworkListEmptyState;
