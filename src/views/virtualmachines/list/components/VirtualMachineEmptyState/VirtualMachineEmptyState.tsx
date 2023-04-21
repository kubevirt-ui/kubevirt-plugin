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
        <Trans t={t} ns="plugin__kubevirt-plugin">
          See the{' '}
          <Button variant={ButtonVariant.link} onClick={() => history.push(catalogURL)} isInline>
            catalog tab
          </Button>{' '}
          to quickly create a VirtualMachine from the available Templates.
        </Trans>
      </EmptyStateBody>
      <EmptyStatePrimary>
        <VirtualMachinesCreateButton
          namespace={namespace}
          buttonText={t('Create VirtualMachine')}
        />
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

export default VirtualMachineEmptyState;
