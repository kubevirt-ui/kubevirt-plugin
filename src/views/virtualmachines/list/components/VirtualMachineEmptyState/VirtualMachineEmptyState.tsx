import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
import { RocketIcon, VirtualMachineIcon } from '@patternfly/react-icons';

import VirtualMachinesCreateButton from '../VirtualMachinesCreateButton/VirtualMachinesCreateButton';

type VirtualMachineEmptyStateProps = {
  catalogURL: string;
  namespace: string;
};

const VirtualMachineEmptyState: FC<VirtualMachineEmptyStateProps> = ({ catalogURL, namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        headingLevel="h4"
        icon={<EmptyStateIcon icon={VirtualMachineIcon} />}
        titleText={<>{t('No VirtualMachines found')}</>}
      />
      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          See the{' '}
          <Button isInline onClick={() => navigate(catalogURL)} variant={ButtonVariant.link}>
            catalog tab
          </Button>{' '}
          to quickly create a VirtualMachine from the available Templates.
        </Trans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <VirtualMachinesCreateButton
            buttonText={t('Create VirtualMachine')}
            namespace={namespace}
          />
        </EmptyStateActions>
        <EmptyStateActions>
          <Button
            onClick={() =>
              navigate({ pathname: '/quickstart', search: '?keyword=virtual+machine' })
            }
            icon={<RocketIcon />}
            variant={ButtonVariant.secondary}
          >
            {t('Learn how to use VirtualMachines')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default VirtualMachineEmptyState;
