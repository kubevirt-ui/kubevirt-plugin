import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, Stack, StackItem } from '@patternfly/react-core';
import DisksTable from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/components/ReviewGridRightColumn/components/DisksTable';
import HardwareDevicesTable from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/components/ReviewGridRightColumn/components/HardwareDevicesTable';
import NetworksTable from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/components/ReviewGridRightColumn/components/NetworksTable';

import './ReviewGridRightColumn.scss';

const ReviewGridRightColumn: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack className="review-grid-right-column" hasGutter>
      <StackItem>
        <ExpandableSection isIndented toggleText={t('Storage')}>
          <DisksTable />
        </ExpandableSection>
      </StackItem>
      <StackItem>
        <ExpandableSection isIndented toggleText={t('Network')}>
          <NetworksTable />
        </ExpandableSection>
      </StackItem>
      <StackItem>
        <ExpandableSection isIndented toggleText={t('Hardware devices')}>
          <HardwareDevicesTable />
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

export default ReviewGridRightColumn;
