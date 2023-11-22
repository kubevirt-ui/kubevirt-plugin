import React, { FC } from 'react';

import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';

import EnableFeatureCheckboxControlled from './EnableFeatureCheckboxConrolled';

import './EnableFeatureCheckbox.scss';

type EnableFeatureCheckboxProps = {
  description?: string;
  externalLink?: string;
  featureName: string;
  helpText?: string;
  id: string;
  label: string;
};

const EnableFeatureCheckbox: FC<EnableFeatureCheckboxProps> = (props) => {
  const { canEdit, featureEnabled, loading, toggleFeature } = useFeatures(props?.featureName);

  return (
    <EnableFeatureCheckboxControlled
      canEdit={canEdit}
      featureEnabled={featureEnabled}
      {...props}
      loading={loading}
      toggleFeature={toggleFeature}
    />
  );
};

export default EnableFeatureCheckbox;
