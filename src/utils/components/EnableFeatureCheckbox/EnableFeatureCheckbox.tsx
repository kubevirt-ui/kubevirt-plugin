import React, { FC, useEffect, useState } from 'react';

import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { Loading } from '@patternfly/quickstarts';
import { Button, ButtonVariant, Checkbox, Flex, FlexItem, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import ExternalLink from '../ExternalLink/ExternalLink';

import './EnableFeatureCheckbox.scss';

type EnableFeatureCheckboxProps = {
  description?: string;
  externalLink?: string;
  featureName: string;
  helpText?: string;
  id: string;
  label: string;
};

const EnableFeatureCheckbox: FC<EnableFeatureCheckboxProps> = ({
  description,
  externalLink,
  featureName,
  helpText,
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
        <Flex spaceItems={{ default: 'spaceItemsNone' }}>
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
          {helpText && (
            <Popover bodyContent={helpText}>
              <Button variant={ButtonVariant.plain}>
                <HelpIcon />
              </Button>
            </Popover>
          )}
        </Flex>
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
