import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import VirtualMachinesCreateButton from '../VirtualMachinesCreateButton/VirtualMachinesCreateButton';

import './VirtualMachineEmptyState.scss';

type VirtualMachineEmptyStateProps = {
  namespace: string;
};

const VirtualMachineEmptyState: FC<VirtualMachineEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageBody>
      <EmptyState
        className="VirtualMachineEmptyState"
        headingLevel="h2"
        icon={VirtualMachineIcon}
        titleText={t('No virtual machines yet')}
        variant={EmptyStateVariant.lg}
      >
        <EmptyStateBody>
          <div>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Click <b>Create VirtualMachine</b> to get started, or right-click a project in the
              left navigation tree.
            </Trans>
          </div>
          <div className="pf-v6-u-mt-md">
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              <b>Don&apos;t have a project yet?</b> Right-click a cluster in the navigation tree to
              create your first one.
            </Trans>
          </div>
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <VirtualMachinesCreateButton
              buttonText={t('Create VirtualMachine')}
              namespace={namespace}
              showDropdown={false}
            />
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </ListPageBody>
  );
};

export default VirtualMachineEmptyState;
