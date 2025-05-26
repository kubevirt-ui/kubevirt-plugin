import React, { FC, useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';
import { uniq } from 'lodash';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { FormGroup, Radio } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

import RecommendationLabel from './RecommendationLabel';
import { getAccessModesForVolume, VOLUME_MODE_RADIO_OPTIONS } from './utils';

import './ApplyStorageProfileSettings.scss';

type VolumeModeProps = {
  claimPropertySets: ClaimPropertySets;
  setAccessMode: (accessMode?: V1beta1StorageSpecAccessModesEnum) => void;
  setVolumeMode: (volumeMode?: V1beta1StorageSpecVolumeModeEnum) => void;
  volumeMode: V1beta1StorageSpecVolumeModeEnum;
};

export const VolumeMode: FC<VolumeModeProps> = ({
  claimPropertySets,
  setAccessMode,
  setVolumeMode,
  volumeMode,
}) => {
  const { t } = useKubevirtTranslation();

  const recommendedVolumeModes = uniq(
    claimPropertySets
      .map((it) => it.volumeMode)
      .filter((mode) =>
        Object.values(V1beta1StorageSpecVolumeModeEnum).some((key) => key === mode),
      ),
  );

  const setBothModes = useCallback(
    (mode) => {
      const accessModes = getAccessModesForVolume(claimPropertySets, mode);
      setAccessMode(accessModes[0]);
      setVolumeMode(mode);
    },
    [claimPropertySets, setAccessMode, setVolumeMode],
  );

  useEffect(() => {
    if (volumeMode || !recommendedVolumeModes?.[0]) {
      return;
    }
    const mostRecommended = recommendedVolumeModes[0];
    setBothModes(mostRecommended);
  }, [volumeMode, recommendedVolumeModes, setBothModes]);

  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Learn more about{' '}
              <Link target="_blank" to={documentationURL.STORAGE_PROFILES}>
                StorageProfile
              </Link>
              .
            </Trans>
          }
        />
      }
      isStack
      label={t('Volume Mode')}
    >
      {VOLUME_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Radio
          label={
            <div className="ApplyStorageProfileSettings--labelWithGap">
              {label}
              <RecommendationLabel
                priority={recommendedVolumeModes.findIndex((it) => it === value)}
                recommendationCount={recommendedVolumeModes.length}
              />
            </div>
          }
          onChange={(_event, checked) => {
            if (checked) {
              setBothModes(value);
            }
          }}
          id={value}
          isChecked={value === volumeMode}
          key={value}
          name="volumeMode"
        />
      ))}
    </FormGroup>
  );
};

export default VolumeMode;
