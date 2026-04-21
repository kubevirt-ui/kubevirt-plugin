import React, { FC } from 'react';

import { V1InstancetypeMatcher, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { CLOUDINITDISK } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getInstanceTypeMatcher,
  getInterfaces,
  useVMIAndPodsForVM,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import {
  getMigratableVolumeSnapshotStatuses,
  getNonMigratableVolumeSnapshotStatuses,
} from '@kubevirt-utils/resources/vm/utils/snapshotStatuses';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Alert, AlertVariant, DescriptionList, FormGroup } from '@patternfly/react-core';

import InstanceTypeConfiguration from './InstanceTypeConfiguration';

type ConfigurationSummaryProps = {
  vm: V1VirtualMachine;
};

const ConfigurationSummary: FC<ConfigurationSummaryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const itMatcher: V1InstancetypeMatcher = getInstanceTypeMatcher(vm);

  const { vmi } = useVMIAndPodsForVM(getName(vm), getNamespace(vm), getCluster(vm));
  const [guestAgentData] = useGuestOS(vmi);
  const osName = (guestAgentData?.os?.prettyName || guestAgentData?.os?.name) ?? (
    <GuestAgentIsRequiredText vmi={vmi} />
  );

  const migratableDisks = getMigratableVolumeSnapshotStatuses(vm);
  const nonMigratableDisks = getNonMigratableVolumeSnapshotStatuses(vm)?.filter(
    (disk) => disk.name !== CLOUDINITDISK,
  );

  const interfaces = getInterfaces(vm);

  const notAvailableText = <MutedTextSpan text={t('Not available')} />;

  return (
    <>
      <FormGroup fieldId="configuration" hasNoPaddingTop label={t('Configuration')}>
        <DescriptionList>
          <DescriptionItem
            descriptionData={getOperatingSystemName(vm) || getOperatingSystem(vm) || osName}
            descriptionHeader={t('Operating system')}
          />
          {itMatcher ? (
            <InstanceTypeConfiguration vm={vm} />
          ) : (
            <>
              <DescriptionItem
                descriptionData={<CPUMemory vm={vm} vmi={vmi} />}
                descriptionHeader={t('Flavor')}
              />
              <DescriptionItem
                descriptionData={
                  getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || notAvailableText
                }
                descriptionHeader={t('Workload profile')}
              />
            </>
          )}
          <DescriptionItem
            descriptionData={
              isEmpty(interfaces)
                ? notAvailableText
                : interfaces.map(({ model, name }) => (
                    <div key={name}>{model ? `${name} - ${model}` : name}</div>
                  ))
            }
            descriptionHeader={t('NICs')}
          />
          <DescriptionItem
            descriptionData={
              isEmpty(migratableDisks)
                ? notAvailableText
                : migratableDisks.map((disk) => <div key={disk.name}>{disk.name}</div>)
            }
            descriptionHeader={t('Disks')}
          />
        </DescriptionList>
      </FormGroup>
      {!isEmpty(nonMigratableDisks) && (
        <Alert isInline title={t('Some disks are not migratable')} variant={AlertVariant.warning}>
          {nonMigratableDisks?.map((disk) => (
            <div key={disk.name}>{disk.reason}</div>
          ))}
        </Alert>
      )}
    </>
  );
};

export default ConfigurationSummary;
