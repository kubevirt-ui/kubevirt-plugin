import * as React from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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

import CPUMemory from '../../../../details/tabs/details/components/CPUMemory/CPUMemory';
import { getClonedDisksSummary } from '../utils/helpers';

type ConfigurationSummaryProps = {
  vm: V1VirtualMachine;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  dataVolumes: V1beta1DataVolume[];
};

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({ vm, pvcs, dataVolumes }) => {
  const { t } = useKubevirtTranslation();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData] = useGuestOS(vmi);
  const osName = (guestAgentData?.os?.prettyName || guestAgentData?.os?.name) ?? (
    <MutedTextSpan text={t('Guest agent is required')} />
  );

  return (
    <FormGroup hasNoPaddingTop label={t('Configuration')} fieldId="configuration">
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
        {(getInterfaces(vm) || [])?.map(({ name, model }) => (
          <div key={name}>{model ? `${name} - ${model}` : name}</div>
        ))}
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Disks')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {getClonedDisksSummary(vm, pvcs, dataVolumes)}
      </TextListItem>
    </FormGroup>
  );
};

export default ConfigurationSummary;
