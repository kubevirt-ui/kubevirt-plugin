import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { FormGroup, Radio } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { ACCESS_MODE_FIELD, ACCESS_MODE_FIELDID, VOLUME_MODE_FIELD } from '../utils/constants';
import { ACCESS_MODE_RADIO_OPTIONS, getAccessModesForVolume } from '../utils/modesMapping';

import RecommendationLabel from './RecommendationLabel';

import './ApplyStorageProfileSettings.scss';

type AccessModeProps = {
  allowAllModes: boolean;
  claimPropertySets: ClaimPropertySets;
};

const AccessMode: FC<AccessModeProps> = ({ allowAllModes, claimPropertySets }) => {
  const { t } = useKubevirtTranslation();

  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const [accessModes, volumeMode] = watch([ACCESS_MODE_FIELD, VOLUME_MODE_FIELD]);

  const accessMode = accessModes?.[0];

  const accessModesForVolume = getAccessModesForVolume(claimPropertySets, volumeMode);

  return (
    <FormGroup fieldId={ACCESS_MODE_FIELDID} label={t('Access Mode')}>
      {ACCESS_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Radio
          label={
            <div className="labelWithGap">
              {label}
              <RecommendationLabel
                priority={accessModesForVolume.findIndex((it) => it === value)}
                recommendationCount={accessModesForVolume.length}
              />
            </div>
          }
          onChange={(event, checked) => {
            if (checked) {
              setValue(ACCESS_MODE_FIELD, [value]);
            }
          }}
          id={value}
          isChecked={value === accessMode}
          isDisabled={!accessModesForVolume?.includes(value) && !allowAllModes}
          key={value}
          name={ACCESS_MODE_FIELD}
        />
      ))}
    </FormGroup>
  );
};

export default AccessMode;
