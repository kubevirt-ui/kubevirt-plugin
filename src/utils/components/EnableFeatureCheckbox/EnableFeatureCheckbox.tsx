import React, { FC, useEffect, useState } from 'react';

import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { Loading } from '@patternfly/quickstarts';
import { Checkbox, Flex, FlexItem } from '@patternfly/react-core';

import ExternalLink from '../ExternalLink/ExternalLink';

import './EnableFeatureCheckbox.scss';

type EnableFeatureCheckboxProps = {
  description?: string;
  externalLink?: string;
  featureName: string;
  id: string;
  label: string;
};

const EnableFeatureCheckbox: FC<EnableFeatureCheckboxProps> = ({
  description,
  externalLink,
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
    <Flex>
      <FlexItem className="enable-feature-checkbox">
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
      </FlexItem>
      {externalLink && (
        <FlexItem>
          <ExternalLink href={externalLink} />
        </FlexItem>
      )}
    </Flex>
  );
};

export default EnableFeatureCheckbox;
