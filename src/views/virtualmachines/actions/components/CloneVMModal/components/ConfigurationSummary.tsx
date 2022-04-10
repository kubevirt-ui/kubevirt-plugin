import * as React from 'react';
import Flavor from 'src/views/virtualmachines/details/tabs/details/components/Flavor/Flavor';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getInterfaces, VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { FormGroup, TextListItem, TextListItemVariants } from '@patternfly/react-core';

import { getClonedDisksSummery } from '../utils/helpers';

type ConfigurationSummaryProps = {
  vm: V1VirtualMachine;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  dataVolumes: V1beta1DataVolume[];
};

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({ vm, pvcs, dataVolumes }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup hasNoPaddingTop label={t('Configuration')} fieldId="configuration">
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Operating System')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {getOperatingSystemName(vm) || getOperatingSystem(vm)}
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Flavor')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        <Flavor vm={vm} />
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Workload Profile')}
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
        {getClonedDisksSummery(vm, pvcs, dataVolumes)}
      </TextListItem>
    </FormGroup>
  );
};

export default ConfigurationSummary;
