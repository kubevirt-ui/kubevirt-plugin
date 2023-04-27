import React, { Dispatch, FC, SetStateAction } from 'react';

import { ProjectsDropdown } from '@catalog/templatescatalog/components/ProjectsDropdown/ProjectsDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { VolumeIcon } from '@patternfly/react-icons';

type BootableVolumesEmptyStateProps = {
  volumeNamespace: string;
  setVolumeNamespace: Dispatch<SetStateAction<string>>;
};

const BootableVolumesEmptyState: FC<BootableVolumesEmptyStateProps> = ({
  volumeNamespace,
  setVolumeNamespace,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={VolumeIcon} />
      <EmptyStateBody>
        {t('There are no bootable volumes in this namespace.\nTry a different namespace.')}
      </EmptyStateBody>
      <EmptyStateSecondaryActions>
        <ProjectsDropdown
          selectedProject={volumeNamespace}
          onChange={setVolumeNamespace}
          title={t('Volumes project')}
        />
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default BootableVolumesEmptyState;
