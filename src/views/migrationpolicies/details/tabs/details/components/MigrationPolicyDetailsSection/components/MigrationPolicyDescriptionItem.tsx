import React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
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
    <DescriptionListDescription>{description || NO_DATA_DASH}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default MigrationPolicyDescriptionItem;
