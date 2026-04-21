import React, { FC, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { DescriptionList, ExpandableSection } from '@patternfly/react-core';

import InstanceTypeConfiguration from './InstanceTypeConfiguration';

type CloneVMModalDetailsSectionProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const CloneVMModalDetailsSection: FC<CloneVMModalDetailsSectionProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  const [isExpanded, setIsExpanded] = useState(true);

  const [guestAgentData] = useGuestOS(vmi);
  const osName =
    guestAgentData?.os?.prettyName ||
    guestAgentData?.os?.name ||
    getOperatingSystemName(vm) ||
    getOperatingSystem(vm);

  const itMatcher = getInstanceTypeMatcher(vm);
  const sshSecretName = getVMSSHSecretName(vm);
  const notAvailable = <MutedTextSpan text={t('Not available')} />;

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={(_, expanded) => setIsExpanded(expanded)}
      toggleText={t('Details')}
    >
      <DescriptionList isHorizontal>
        <DescriptionItem
          descriptionData={getNamespace(vm) || notAvailable}
          descriptionHeader={t('Project')}
        />
        <DescriptionItem
          descriptionData={sshSecretName || <MutedTextSpan text={t('Not configured')} />}
          descriptionHeader={t('Public SSH key')}
        />
        <DescriptionItem
          descriptionData={osName || notAvailable}
          descriptionHeader={t('Operating system')}
        />
        {itMatcher ? (
          <InstanceTypeConfiguration vm={vm} />
        ) : (
          <DescriptionItem
            descriptionData={<CPUMemory vm={vm} vmi={vmi} />}
            descriptionHeader={t('Flavor')}
          />
        )}
      </DescriptionList>
    </ExpandableSection>
  );
};

export default CloneVMModalDetailsSection;
