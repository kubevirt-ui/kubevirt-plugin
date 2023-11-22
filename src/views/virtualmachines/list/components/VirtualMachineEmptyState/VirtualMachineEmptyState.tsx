import React, { FC } from 'react';
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

import VirtualMachinesCreateButton from '../VirtualMachinesCreateButton/VirtualMachinesCreateButton';

type VirtualMachineEmptyStateProps = {
  catalogURL: string;
  namespace: string;
};

const VirtualMachineEmptyState: FC<VirtualMachineEmptyStateProps> = ({ catalogURL, namespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <EmptyStateIcon icon={VirtualMachineIcon} />
      <Title headingLevel="h4" size="lg">
        {t('No VirtualMachines found')}
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
        <VirtualMachinesCreateButton
          buttonText={t('Create VirtualMachine')}
          namespace={namespace}
        />
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

export default VirtualMachineEmptyState;
