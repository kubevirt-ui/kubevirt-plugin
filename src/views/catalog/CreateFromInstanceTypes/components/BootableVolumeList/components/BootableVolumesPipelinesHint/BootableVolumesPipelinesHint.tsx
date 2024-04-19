import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import AddBootableVolumeLink from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeLink/AddBootableVolumeLink';
import QuickStartLauncherLink from '@catalog/CreateFromInstanceTypes/components/BootableVolumeList/components/BootableVolumesPipelinesHint/QuickStartLauncherLink/QuickStartLauncherLink';
import useBootableVolumeOSes from '@catalog/CreateFromInstanceTypes/components/BootableVolumeList/hooks/useBootableVolumeOSes';
import useQuickStart from '@catalog/CreateFromInstanceTypes/components/BootableVolumeList/hooks/useQuickStart';
import { WINDOWS_BOOTSOURCE_PIPELINE } from '@catalog/CreateFromInstanceTypes/components/BootableVolumeList/utils/constants';
import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';
import { getIconByOSName } from '@catalog/templatescatalog/utils/os-icons';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import './BootableVolumesPipelinesHint.scss';

type BootableVolumesPipelinesHintProps = { bootableVolumes: BootableVolume[] };

const BootableVolumesPipelinesHint: FC<BootableVolumesPipelinesHintProps> = ({
  bootableVolumes,
}) => {
  const { t } = useKubevirtTranslation();
  const { loadError } = useInstanceTypesAndPreferences();

  const [windowsQS, windowsQSLoaded] = useQuickStart(WINDOWS_BOOTSOURCE_PIPELINE);

  const { hasRHEL, hasWindows } = useBootableVolumeOSes(bootableVolumes);
  const windowsIcon = getIconByOSName(OS_NAME_TYPES.windows);
  const rhelIcon = getIconByOSName(OS_NAME_TYPES.rhel);

  if (!hasWindows && !hasRHEL) {
    return (
      <div className="bootable-volumes-pipelines-hint">
        <img alt="os-icon" className="bootable-volumes-pipelines-hint__icon" src={rhelIcon} />
        <img alt="os-icon" className="bootable-volumes-pipelines-hint__icon" src={windowsIcon} />
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Interested in other <b>Bootable Volumes</b>? Click{' '}
          <AddBootableVolumeLink loadError={loadError} /> to get started.
        </Trans>
      </div>
    );
  }

  if (!hasWindows) {
    return (
      <div className="bootable-volumes-pipelines-hint">
        <img alt="os-icon" className="bootable-volumes-pipelines-hint__icon" src={windowsIcon} />
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Interested in using a <b>Windows Bootable Volume</b>? Click{' '}
          <AddBootableVolumeLink loadError={loadError} /> to get started.To learn more, follow the{' '}
          <QuickStartLauncherLink
            quickStart={windowsQS}
            quickStartLoaded={windowsQSLoaded}
            text={t('Create a Windows boot source')}
          />{' '}
          quick start.
        </Trans>
      </div>
    );
  }

  if (!hasRHEL) {
    return (
      <div className="bootable-volumes-pipelines-hint">
        <img alt="os-icon" className="bootable-volumes-pipelines-hint__icon" src={rhelIcon} />
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Interested in using a <b>RHEL Bootable Volume</b>? Click{' '}
          <AddBootableVolumeLink loadError={loadError} /> to get started.
        </Trans>
      </div>
    );
  }

  return null;
};

export default BootableVolumesPipelinesHint;
