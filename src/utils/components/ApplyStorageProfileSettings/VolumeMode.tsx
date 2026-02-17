import React, { FC, useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { uniq } from 'lodash';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
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
  const recommendedVolumeMode = recommendedVolumeModes?.[0];

  const setBothModes = useCallback(
    (mode) => {
      const accessModes = getAccessModesForVolume(claimPropertySets, mode);
      setAccessMode(accessModes[0]);
      setVolumeMode(mode);
    },
    [claimPropertySets, setAccessMode, setVolumeMode],
  );

  useEffect(() => {
    if (volumeMode || !recommendedVolumeMode) {
      return;
    }
    setBothModes(recommendedVolumeMode);
  }, [volumeMode, recommendedVolumeMode, setBothModes]);

  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={
                <Trans ns="plugin__kubevirt-plugin" t={t}>
                  Learn more about{' '}
                  <a href={documentationURL.VOLUME_MODE} rel="noopener noreferrer" target="_blank">
                    volume modes
                  </a>
                  .
                </Trans>
              }
              hide={hide}
              promptType={OLSPromptType.VOLUME_MODE}
            />
          )}
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
              {recommendedVolumeMode === value && <RecommendationLabel />}
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
