import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import AddBootableVolumeLink from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeLink/AddBootableVolumeLink';
import BootableVolumeOSIcons from '@catalog/CreateFromInstanceTypes/components/BootableVolumeEmptyState/BootableVolumeOSIcons';
import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, Title } from '@patternfly/react-core';

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
          To add a bootable volume, click <AddBootableVolumeLink loadError={loadError} /> Add volume
        </Trans>
        <BootableVolumeOSIcons />
      </div>
    </EmptyState>
  );
};

export default BootableVolumeEmptyState;
