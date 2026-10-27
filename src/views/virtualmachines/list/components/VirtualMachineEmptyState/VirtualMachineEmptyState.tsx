import { type FC } from 'react';
import { Trans } from 'react-i18next';

import { ProjectRequestModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
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
import { getEmptyStateDescription } from './utils/getEmptyStateDescription';

import './VirtualMachineEmptyState.scss';

type VirtualMachineEmptyStateProps = {
  namespace: string;
};

const VirtualMachineEmptyState: FC<VirtualMachineEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const isAllProjectsScope = isAllNamespaces(namespace);

  const [canCreateVMInProject, loadingVM] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: namespace || DEFAULT_NAMESPACE,
    resource: VirtualMachineModel.plural,
    verb: 'create',
  });

  const [canCreateProject, loadingProject] = useAccessReview({
    group: ProjectRequestModel.apiGroup,
    resource: ProjectRequestModel.plural,
    verb: 'create',
  });

  const loading = isAllProjectsScope ? loadingProject : loadingVM || loadingProject;

  const emptyStateDescription = getEmptyStateDescription(
    isAllProjectsScope,
    canCreateVMInProject,
    t,
  );

  return (
    <ListPageBody>
      <EmptyState
        className="VirtualMachineEmptyState"
        headingLevel="h2"
        icon={VirtualMachineIcon}
        titleText={t("You don't have any VirtualMachines yet")}
        variant={EmptyStateVariant.lg}
      >
        <EmptyStateBody>
          {loading ? (
            <Skeleton screenreaderText={t('Loading')} width="75%" />
          ) : (
            <>
              <div>{emptyStateDescription}</div>
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
        {!loading && (
          <EmptyStateFooter>
            <EmptyStateActions>
              <VirtualMachinesCreateButton
                buttonText={t('Create VirtualMachine')}
                namespace={namespace}
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
