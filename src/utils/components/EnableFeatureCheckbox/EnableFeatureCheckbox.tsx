import React, { FC, useEffect, useState } from 'react';

import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { Loading } from '@patternfly/quickstarts';
import { Checkbox } from '@patternfly/react-core';

type EnableFeatureCheckboxProps = {
  description?: string;
  featureName: string;
  id: string;
  label: string;
};

const EnableFeatureCheckbox: FC<EnableFeatureCheckboxProps> = ({
  description,
  featureName,
  id,
  label,
}) => {
  const { canEdit, featureEnabled, loading, toggleFeature } = useFeatures(featureName);

  const [isChecked, setIsChecked] = useState<boolean>(null);

  useEffect(() => {
    if (!loading && isChecked === null) {
      setIsChecked(featureEnabled);
    }
  }, [loading, featureEnabled, isChecked]);

  if (loading) return <Loading />;

  return (
    <Checkbox
      onClick={(event) => {
        toggleFeature(event.currentTarget.checked);
        setIsChecked(event.currentTarget.checked);
      }}
      description={description}
      id={id}
      isChecked={isChecked}
      isDisabled={!canEdit || loading}
      label={label}
    />
  );
};

export default EnableFeatureCheckbox;
