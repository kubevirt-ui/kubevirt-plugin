import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
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
import { RouteIcon, VirtualMachineIcon } from '@patternfly/react-icons';

import VirtualMachinesCreateButton from '../VirtualMachinesCreateButton/VirtualMachinesCreateButton';

import './VirtualMachineEmptyState.scss';

type VirtualMachineEmptyStateProps = {
  catalogURL: string;
  namespace: string;
};

const VirtualMachineEmptyState: FC<VirtualMachineEmptyStateProps> = ({ catalogURL, namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <>
      <ListPageHeader title={t('VirtualMachines')} />
      <ListPageBody>
        <EmptyState className="VirtualMachineEmptyState" variant={EmptyStateVariant.lg}>
          <EmptyStateHeader
            headingLevel="h4"
            icon={<EmptyStateIcon icon={VirtualMachineIcon} />}
            titleText={<>{t('No VirtualMachines found')}</>}
          />
          <EmptyStateBody>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Click <b>Create VirtualMachine</b> to create your first VirtualMachine or view the{' '}
              <Button isInline onClick={() => navigate(catalogURL)} variant={ButtonVariant.link}>
                catalog
              </Button>{' '}
              tab to create a VirtualMachine from the available options
            </Trans>
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <VirtualMachinesCreateButton
                buttonText={t('Create VirtualMachine')}
                namespace={namespace}
              />
            </EmptyStateActions>
            <br />
            <EmptyStateActions>
              <Link to={'/quickstart?keyword=virtual+machine'}>
                {t('Learn how to use VirtualMachines')} <RouteIcon />
              </Link>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineEmptyState;
