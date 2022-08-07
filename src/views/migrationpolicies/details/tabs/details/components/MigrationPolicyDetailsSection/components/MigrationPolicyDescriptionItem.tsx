import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
} from '@patternfly/react-core';

type MigrationPolicyDescriptionItemProps = {
  title: string;
  description: React.ReactNode;
};

const MigrationPolicyDescriptionItem: React.FC<MigrationPolicyDescriptionItemProps> = ({
  title,
  description,
}) => (
  <DescriptionListGroup>
    <DescriptionListTermHelpText>
      <DescriptionListTermHelpTextButton>{title}</DescriptionListTermHelpTextButton>
    </DescriptionListTermHelpText>
    <DescriptionListDescription>{description}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default MigrationPolicyDescriptionItem;
