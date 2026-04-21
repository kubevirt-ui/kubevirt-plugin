import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DisksReviewTable from '@kubevirt-utils/components/DisksReviewTable/DisksReviewTable';
import NetworksReviewTable from '@kubevirt-utils/components/NetworksReviewTable/NetworksReviewTable';
import { CLOUDINITDISK } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { getNonMigratableVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm/utils/snapshotStatuses';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Alert,
  AlertVariant,
  ExpandableSection,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import CloneVMModalDetailsSection from './CloneVMModalDetailsSection';
import CloneVMModalHardwareDevicesSection from './CloneVMModalHardwareDevicesSection';

type CloneVMModalConfigSectionProps = {
  vm: V1VirtualMachine;
};

const CloneVMModalConfigSection: FC<CloneVMModalConfigSectionProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const { vmi } = useVMI(getName(vm), getNamespace(vm), getCluster(vm));
  const [disks, disksLoaded] = useDisksTableData(vm, vmi);

  const nonMigratableDisks = getNonMigratableVolumeSnapshotStatuses(vm)?.filter(
    (disk) => disk.name !== CLOUDINITDISK,
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <CloneVMModalDetailsSection vm={vm} vmi={vmi} />
      </StackItem>

      <StackItem>
        <ExpandableSection isIndented toggleText={t('Storage')}>
          {disksLoaded ? <DisksReviewTable disks={disks} /> : <Skeleton />}
        </ExpandableSection>
      </StackItem>

      {!isEmpty(nonMigratableDisks) && (
        <StackItem>
          <Alert isInline title={t('Some disks are not migratable')} variant={AlertVariant.warning}>
            {nonMigratableDisks.map((disk) => (
              <div key={disk.name}>{disk.reason}</div>
            ))}
          </Alert>
        </StackItem>
      )}

      <StackItem>
        <ExpandableSection isIndented toggleText={t('Networking')}>
          <NetworksReviewTable interfaces={getInterfaces(vm)} networks={getNetworks(vm)} />
        </ExpandableSection>
      </StackItem>

      <StackItem>
        <CloneVMModalHardwareDevicesSection vm={vm} />
      </StackItem>
    </Stack>
  );
};

export default CloneVMModalConfigSection;
