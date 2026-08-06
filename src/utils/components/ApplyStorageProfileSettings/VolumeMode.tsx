import React, { type FC, useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import uniq from 'lodash/uniq';

import {
  type V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type ClaimPropertySets } from '@kubevirt-utils/types/storage';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, Radio } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';
import RecommendationLabel from './RecommendationLabel';
import { getAccessModesForVolume, VOLUME_MODE_RADIO_OPTIONS } from './utils';

import './ApplyStorageProfileSettings.scss';

type VolumeModeProps = {
  claimPropertySets: ClaimPropertySets;
  isDisabled?: boolean;
  setAccessMode: (accessMode?: V1beta1StorageSpecAccessModesEnum) => void;
  setVolumeMode: (volumeMode?: V1beta1StorageSpecVolumeModeEnum) => void;
  volumeMode: V1beta1StorageSpecVolumeModeEnum;
};

export const VolumeMode: FC<VolumeModeProps> = ({
  claimPropertySets,
  isDisabled,
  setAccessMode,
  setVolumeMode,
  volumeMode,
}) => {
  const { t } = useKubevirtTranslation();

  const recommendedVolumeModes = (uniq as <T>(arr: T[]) => T[])(
    claimPropertySets
      .map((item) => item.volumeMode)
      .filter((mode): mode is V1beta1StorageSpecVolumeModeEnum =>
        (Object.values(V1beta1StorageSpecVolumeModeEnum) as string[]).includes(mode as string),
      ),
  );
  const recommendedVolumeMode = recommendedVolumeModes?.[0];

  const setBothModes = useCallback(
    (mode: V1beta1StorageSpecVolumeModeEnum) => {
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
      isStack
      label={t('Volume mode')}
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
    >
      {VOLUME_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Radio
          id={value}
          isChecked={value === volumeMode}
          isDisabled={isDisabled}
          key={value}
          label={
            <div className="ApplyStorageProfileSettings--labelWithGap">
              {label}
              {recommendedVolumeMode === value && <RecommendationLabel />}
            </div>
          }
          name="volumeMode"
          onChange={(_event, checked) => {
            if (checked) {
              setBothModes(value);
            }
          }}
        />
      ))}
    </FormGroup>
  );
};

export default VolumeMode;
