import * as React from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

type VirtualMachineInstanceEmptyStateProps = {
  catalogURL: string;
};
const VirtualMachineInstanceEmptyState: React.FC<VirtualMachineInstanceEmptyStateProps> = ({
  catalogURL,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size="lg">
        {t('No VirtualMachinesInstances found')}
      </Title>
      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          See the{' '}
          <Button isInline onClick={() => history.push(catalogURL)} variant={ButtonVariant.link}>
            catalog tab
          </Button>{' '}
          to quickly create a VirtualMachine from the available Templates.
        </Trans>
      </EmptyStateBody>
      <EmptyStatePrimary>
        <Button onClick={() => history.push(catalogURL)} variant={ButtonVariant.primary}>
          {t('Create VirtualMachine')}
        </Button>
      </EmptyStatePrimary>
      <EmptyStateSecondaryActions>
        <Button
          onClick={() =>
            history.push({ pathname: '/quickstart', search: '?keyword=virtual+machine' })
          }
          icon={<RocketIcon />}
          variant={ButtonVariant.secondary}
        >
          {t('Learn how to use VirtualMachines')}
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default VirtualMachineInstanceEmptyState;
