import * as React from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  getInterfaces,
  useVMIAndPodsForVM,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { FormGroup, TextListItem, TextListItemVariants } from '@patternfly/react-core';

import { getClonedDisksSummary } from '../utils/helpers';

type ConfigurationSummaryProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  vm: V1VirtualMachine;
};

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({ pvcs, vm }) => {
  const { t } = useKubevirtTranslation();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData] = useGuestOS(vmi);
  const osName = (guestAgentData?.os?.prettyName || guestAgentData?.os?.name) ?? (
    <GuestAgentIsRequiredText vmi={vmi} />
  );

  return (
    <FormGroup fieldId="configuration" hasNoPaddingTop label={t('Configuration')}>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Operating system')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {getOperatingSystemName(vm) || getOperatingSystem(vm) || osName}
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Flavor')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        <CPUMemory vm={vm} />
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Workload profile')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
          <MutedTextSpan text={t('Not available')} />
        )}
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('NICs')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {(getInterfaces(vm) || [])?.map(({ model, name }) => (
          <div key={name}>{model ? `${name} - ${model}` : name}</div>
        ))}
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Disks')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {getClonedDisksSummary(vm, pvcs)}
      </TextListItem>
    </FormGroup>
  );
};

export default ConfigurationSummary;
