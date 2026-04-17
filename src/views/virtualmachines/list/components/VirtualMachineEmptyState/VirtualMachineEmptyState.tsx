import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { ProjectRequestModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Skeleton,
} from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import VirtualMachinesCreateButton from '../VirtualMachinesCreateButton/VirtualMachinesCreateButton';

import './VirtualMachineEmptyState.scss';

type VirtualMachineEmptyStateProps = {
  namespace: string;
};

const VirtualMachineEmptyState: FC<VirtualMachineEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const selectedNamespace = namespace || DEFAULT_NAMESPACE;

  const [canCreateVM, loadingVM] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: selectedNamespace,
    resource: VirtualMachineModel.plural,
    verb: 'create',
  });

  const [canCreateProject, loadingProject] = useAccessReview({
    group: ProjectRequestModel.apiGroup,
    resource: ProjectRequestModel.plural,
    verb: 'create',
  });

  const loading = loadingVM || loadingProject;

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
          {loading ? (
            <Skeleton screenreaderText={t('Loading')} width="75%" />
          ) : (
            <>
              {canCreateVM ? (
                <div>
                  <Trans ns="plugin__kubevirt-plugin" t={t}>
                    Click <b>Create VirtualMachine</b> to get started, or right-click a project in
                    the left navigation tree.
                  </Trans>
                </div>
              ) : (
                <div>{t('To create a virtual machine, contact an administrator.')}</div>
              )}
              {canCreateProject && (
                <div className="pf-v6-u-mt-md">
                  <Trans ns="plugin__kubevirt-plugin" t={t}>
                    <b>Don&apos;t have a project yet?</b> Right-click a cluster in the navigation
                    tree to create your first one.
                  </Trans>
                </div>
              )}
            </>
          )}
        </EmptyStateBody>
        {!loading && canCreateVM && (
          <EmptyStateFooter>
            <EmptyStateActions>
              <VirtualMachinesCreateButton
                buttonText={t('Create VirtualMachine')}
                namespace={selectedNamespace}
                showDropdown={false}
              />
            </EmptyStateActions>
          </EmptyStateFooter>
        )}
      </EmptyState>
    </ListPageBody>
  );
};

export default VirtualMachineEmptyState;
