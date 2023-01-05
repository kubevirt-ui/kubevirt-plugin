import React from 'react';

import { DescriptionItemHeader } from '@kubevirt-utils/components/DescriptionItem/DescriptionItemHeader';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
} from '@patternfly/react-core';

type MigrationPolicyDescriptionItemProps = {
  title: string;
  description?: React.ReactNode;
  isPopover?: boolean;
  popoverContent?: React.ReactNode;
  moreInfoURL?: string;
  breadcrumb?: string;
  hasAutoWidth?: boolean;
};

const MigrationPolicyDescriptionItem: React.FC<MigrationPolicyDescriptionItemProps> = ({
  title,
  description,
  isPopover,
  popoverContent,
  moreInfoURL,
  breadcrumb,
}) => (
  <DescriptionListGroup>
    <DescriptionListTermHelpText>
      <DescriptionItemHeader
        isPopover={isPopover}
        bodyContent={popoverContent}
        moreInfoURL={moreInfoURL}
        breadcrumb={breadcrumb}
        descriptionHeader={title}
      />
    </DescriptionListTermHelpText>
    <DescriptionListDescription>{description || NO_DATA_DASH}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default MigrationPolicyDescriptionItem;
