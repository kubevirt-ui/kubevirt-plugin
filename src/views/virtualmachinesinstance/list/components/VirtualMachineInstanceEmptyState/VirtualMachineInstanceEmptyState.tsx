import * as React from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
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
import { RocketIcon, VirtualMachineIcon } from '@patternfly/react-icons';

const VirtualMachineInstanceEmptyState: React.FC = ({}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [namespace] = useActiveNamespace();
  const isAllNamespaces = namespace === '#ALL_NS#';
  const namespaceURL = isAllNamespaces ? `all-namespaces` : `ns/${namespace}`;
  const catalogURL = `/k8s/${namespaceURL}/templatescatalog`;

  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size="lg">
        {t('No VirtualMachinesInstances found')}
      </Title>
      <EmptyStateBody>
        <Trans t={t} ns="plugin__kubevirt-plugin">
          See the{' '}
          <Button variant={ButtonVariant.link} onClick={() => history.push(catalogURL)} isInline>
            catalog tab
          </Button>{' '}
          to quickly create a virtual machine from the available templates.
        </Trans>
      </EmptyStateBody>
      <EmptyStatePrimary>
        <Button variant={ButtonVariant.primary} onClick={() => history.push(catalogURL)}>
          {t('Create VirtualMachine')}
        </Button>
      </EmptyStatePrimary>
      <EmptyStateSecondaryActions>
        <Button
          variant={ButtonVariant.secondary}
          onClick={() =>
            history.push({ pathname: '/quickstart', search: '?keyword=virtual+machine' })
          }
          icon={<RocketIcon />}
        >
          {t('Learn how to use VirtualMachines')}
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default VirtualMachineInstanceEmptyState;
