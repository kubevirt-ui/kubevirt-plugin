import React from 'react';

import { DescriptionItemHeader } from '@kubevirt-utils/components/DescriptionItem/DescriptionItemHeader';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
} from '@patternfly/react-core';

type MigrationPolicyDescriptionItemProps = {
  breadcrumb?: string;
  description?: React.ReactNode;
  hasAutoWidth?: boolean;
  isPopover?: boolean;
  moreInfoURL?: string;
  popoverContent?: React.ReactNode;
  title: string;
};

const MigrationPolicyDescriptionItem: React.FC<MigrationPolicyDescriptionItemProps> = ({
  breadcrumb,
  description,
  isPopover,
  moreInfoURL,
  popoverContent,
  title,
}) => (
  <DescriptionListGroup>
    <DescriptionListTermHelpText>
      <DescriptionItemHeader
        bodyContent={popoverContent}
        breadcrumb={breadcrumb}
        descriptionHeader={title}
        isPopover={isPopover}
        moreInfoURL={moreInfoURL}
      />
    </DescriptionListTermHelpText>
    <DescriptionListDescription>{description || NO_DATA_DASH}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default MigrationPolicyDescriptionItem;
