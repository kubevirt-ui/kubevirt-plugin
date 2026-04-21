import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, Title } from '@patternfly/react-core';
import AddBootableVolumeLink from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/AddBootableVolumeLink/AddBootableVolumeLink';
import BootableVolumeOSIcons from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/BootableVolumeEmptyState/BootableVolumeOSIcons';

import './BootableVolumeEmptyState.scss';

const BootableVolumeEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();
  const { loadError } = useInstanceTypesAndPreferences();

  return (
    <EmptyState>
      <div className="bootable-volume-empty-state">
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          <Title className="bootable-volume-empty-state__title" headingLevel="h3">
            No volumes found
          </Title>
          To add a bootable volume, click <AddBootableVolumeLink loadError={loadError} />
        </Trans>
        <BootableVolumeOSIcons />
      </div>
    </EmptyState>
  );
};

export default BootableVolumeEmptyState;
