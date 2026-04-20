import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { ExpandableSection, Stack, StackItem } from '@patternfly/react-core';
import DisksReviewTable from '@virtualmachines/creation-wizard/components/DisksReviewTable/DisksReviewTable';
import useWizardDisksTableData from '@virtualmachines/creation-wizard/components/DisksReviewTable/hooks/useWizardDisksTableData/useWizardDisksTableData';
import HardwareDevicesTable from '@virtualmachines/creation-wizard/components/HardwareDevicesTable';
import NetworksReviewTable from '@virtualmachines/creation-wizard/components/NetworksReviewTable';

import './ReviewGridRightColumn.scss';

const ReviewGridRightColumn: FCC = () => {
  const { t } = useKubevirtTranslation();

  const vm = vmSignal.value;
  const [disks] = useWizardDisksTableData(vm);
  const interfaces = getInterfaces(vm);
  const networks = getNetworks(vm);

  return (
    <Stack className="review-grid-right-column" hasGutter>
      <StackItem>
        <ExpandableSection isIndented toggleText={t('Storage')}>
          <DisksReviewTable disks={disks} />
        </ExpandableSection>
      </StackItem>
      <StackItem>
        <ExpandableSection isIndented toggleText={t('Network')}>
          <NetworksReviewTable interfaces={interfaces} networks={networks} />
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
