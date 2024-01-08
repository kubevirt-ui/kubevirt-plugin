import React, { FC } from 'react';

import { V1InstancetypeMatcher, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  getDisks,
  getInterfaces,
  useVMIAndPodsForVM,
  VM_WORKLOAD_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, TextListItem, TextListItemVariants } from '@patternfly/react-core';

import InstanceTypeConfiguration from './InstanceTypeConfiguration';

type ConfigurationSummaryProps = {
  vm: V1VirtualMachine;
};

const ConfigurationSummary: FC<ConfigurationSummaryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const itMatcher: V1InstancetypeMatcher = vm?.spec?.instancetype;

  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData] = useGuestOS(vmi);
  const osName = (guestAgentData?.os?.prettyName || guestAgentData?.os?.name) ?? (
    <GuestAgentIsRequiredText vmi={vmi} />
  );

  const interfaces = getInterfaces(vm);

  return (
    <FormGroup fieldId="configuration" hasNoPaddingTop label={t('Configuration')}>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Operating system')}
      </TextListItem>

      <TextListItem component={TextListItemVariants.dd}>
        {getOperatingSystemName(vm) || getOperatingSystem(vm) || osName}
      </TextListItem>

      {itMatcher ? (
        <InstanceTypeConfiguration itMatcher={itMatcher} />
      ) : (
        <>
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('Flavor')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <CPUMemory vm={vm} vmi={vmi} />
          </TextListItem>
          <TextListItem className="text-muted" component={TextListItemVariants.dt}>
            {t('Workload profile')}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
              <MutedTextSpan text={t('Not available')} />
            )}
          </TextListItem>
        </>
      )}
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('NICs')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {(interfaces || [])?.map(({ model, name }) => (
          <div key={name}>{model ? `${name} - ${model}` : name}</div>
        ))}
        {isEmpty(interfaces) && <span className="text-muted">None</span>}
      </TextListItem>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('Disks')}
      </TextListItem>
      <TextListItem component={TextListItemVariants.dd}>
        {(getDisks(vm) || [])?.map((disk) => (
          <div key={disk.name}>{disk.name}</div>
        ))}
      </TextListItem>
    </FormGroup>
  );
};

export default ConfigurationSummary;
