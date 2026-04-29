import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { LINUX, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { EmptyState, Title } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import AddBootableVolumeLink from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/AddBootableVolumeLink/AddBootableVolumeLink';
import BootableVolumeOSIcons from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/BootableVolumeEmptyState/BootableVolumeOSIcons';

import './BootableVolumeEmptyState.scss';

type BootableVolumeEmptyStateProps = {
  isPreferenceFilter?: boolean;
};

const BootableVolumeEmptyState: FC<BootableVolumeEmptyStateProps> = ({ isPreferenceFilter }) => {
  const { t } = useKubevirtTranslation();
  const { loadError } = useInstanceTypesAndPreferences();
  const { preference } = useInstanceTypeVMStore();

  const osName = preference
    ? (() => {
        const base = preference.split('.')[0].split('-')[0];
        return base === OS_NAME_TYPES.rhel || base === OS_NAME_TYPES.windows ? base : LINUX;
      })()
    : undefined;

  return (
    <EmptyState>
      <div className="bootable-volume-empty-state">
        <Title className="bootable-volume-empty-state__title" headingLevel="h3">
          {isPreferenceFilter ? t('No volumes found for the chosen OS') : t('No volumes found')}
        </Title>
        {isPreferenceFilter ? (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            To add a boot source, click <AddBootableVolumeLink loadError={loadError} /> or select
            &quot;No boot source&quot; to assign one later
          </Trans>
        ) : (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            To add a bootable volume, click <AddBootableVolumeLink loadError={loadError} />
          </Trans>
        )}
        <BootableVolumeOSIcons osName={osName} />
      </div>
    </EmptyState>
  );
};

export default BootableVolumeEmptyState;
