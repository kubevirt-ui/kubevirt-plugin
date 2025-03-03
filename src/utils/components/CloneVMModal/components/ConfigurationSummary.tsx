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
import { Content, ContentVariants, FormGroup } from '@patternfly/react-core';

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
      <Content className="text-muted" component={ContentVariants.dt}>
        {t('Operating system')}
      </Content>

      <Content component={ContentVariants.dd}>
        {getOperatingSystemName(vm) || getOperatingSystem(vm) || osName}
      </Content>

      {itMatcher ? (
        <InstanceTypeConfiguration itMatcher={itMatcher} />
      ) : (
        <>
          <Content className="text-muted" component={ContentVariants.dt}>
            {t('Flavor')}
          </Content>
          <Content component={ContentVariants.dd}>
            <CPUMemory vm={vm} vmi={vmi} />
          </Content>
          <Content className="text-muted" component={ContentVariants.dt}>
            {t('Workload profile')}
          </Content>
          <Content component={ContentVariants.dd}>
            {getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
              <MutedTextSpan text={t('Not available')} />
            )}
          </Content>
        </>
      )}
      <Content className="text-muted" component={ContentVariants.dt}>
        {t('NICs')}
      </Content>
      <Content component={ContentVariants.dd}>
        {(interfaces || [])?.map(({ model, name }) => (
          <div key={name}>{model ? `${name} - ${model}` : name}</div>
        ))}
        {isEmpty(interfaces) && <span className="text-muted">None</span>}
      </Content>
      <Content className="text-muted" component={ContentVariants.dt}>
        {t('Disks')}
      </Content>
      <Content component={ContentVariants.dd}>
        {(getDisks(vm) || [])?.map((disk) => (
          <div key={disk.name}>{disk.name}</div>
        ))}
      </Content>
    </FormGroup>
  );
};

export default ConfigurationSummary;
