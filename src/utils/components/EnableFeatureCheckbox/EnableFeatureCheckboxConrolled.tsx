import React, { FC } from 'react';

import { Button, ButtonVariant, Checkbox, Flex, FlexItem, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import ExternalLink from '../ExternalLink/ExternalLink';

import './EnableFeatureCheckbox.scss';

type EnableFeatureCheckboxControlledProps = {
  canEdit: boolean;
  description?: string;
  externalLink?: string;
  featureEnabled: boolean;
  helpText?: string;
  id: string;
  isDisabled?: boolean;
  label: string;
  loading: boolean;
  toggleFeature: (val: boolean) => void;
};

const EnableFeatureCheckboxControlled: FC<EnableFeatureCheckboxControlledProps> = ({
  canEdit,
  description,
  externalLink,
  featureEnabled,
  helpText,
  id,
  label,
  loading,
  toggleFeature,
}) => {
  return (
    <Flex>
      <FlexItem className="enable-feature-checkbox">
        <Flex spaceItems={{ default: 'spaceItemsNone' }}>
          <Checkbox
            onClick={(event) => {
              toggleFeature(event?.currentTarget?.checked);
            }}
            checked={featureEnabled}
            description={description}
            id={id}
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

export default EnableFeatureCheckboxControlled;
