import { type FC } from 'react';
import { Trans } from 'react-i18next';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { EmptyState } from '@patternfly/react-core';
import AddBootableVolumeLink from '@virtualmachines/wizard/components/BootableVolumeList/components/AddBootableVolumeLink/AddBootableVolumeLink';
import BootableVolumeOSIcons from '@virtualmachines/wizard/components/BootableVolumeList/components/BootableVolumeEmptyState/BootableVolumeOSIcons';
import { getOsNameFromPreference } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';

import './BootableVolumeEmptyState.scss';

type BootableVolumeEmptyStateProps = {
  canCreate: boolean;
  loadError?: Error;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
  onUploadStart?: (uploadKey: string) => void;
  preferenceName?: string;
  showNoBootSourceHint?: boolean;
};

const BootableVolumeEmptyState: FC<BootableVolumeEmptyStateProps> = ({
  canCreate,
  loadError,
  lockedPreference,
  onCreateVolume,
  onUploadStart,
  preferenceName,
  showNoBootSourceHint = true,
}) => {
  const { t } = useKubevirtTranslation();

  const osName = getOsNameFromPreference(preferenceName);
  const isScopedToPreference = Boolean(preferenceName);
  const showScopedNoBootSourceHint = isScopedToPreference && showNoBootSourceHint;

  const addVolumeLink = (
    <AddBootableVolumeLink
      canCreate={canCreate}
      loadError={loadError}
      lockedPreference={lockedPreference}
      onCreateVolume={onCreateVolume}
      onUploadStart={onUploadStart}
    />
  );

  return (
    <EmptyState
      className="bootable-volume-empty-state"
      headingLevel="h3"
      titleText={
        isScopedToPreference
          ? t("You don't have any volumes for the chosen OS yet")
          : t("You don't have any volumes yet")
      }
    >
      {showScopedNoBootSourceHint ? (
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          To get started, {addVolumeLink} or select &quot;No boot source&quot; to assign one later.
        </Trans>
      ) : (
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          To get started, {addVolumeLink}.
        </Trans>
      )}
      <BootableVolumeOSIcons osName={osName} />
    </EmptyState>
  );
};

export default BootableVolumeEmptyState;
