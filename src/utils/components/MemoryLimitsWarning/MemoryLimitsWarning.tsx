import { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import {
  getVMMemoryLimit,
  hasRiskyMemoryLimits,
} from '@kubevirt-utils/resources/vm/utils/memoryLimits';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Alert, AlertVariant } from '@patternfly/react-core';

type MemoryLimitsWarningProps = {
  guestMemory?: string;
  isInline?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const MemoryLimitsWarning: FC<MemoryLimitsWarningProps> = ({
  guestMemory,
  isInline = true,
  vm,
  vmi: providedVmi,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const name = getName(vm);
  const namespace = getNamespace(vm);
  const shouldFetchVmi = !providedVmi && Boolean(name && namespace);
  const { vmi: fetchedVmi } = useVMI(name, namespace, cluster, shouldFetchVmi);
  const vmi = providedVmi ?? fetchedVmi;

  const memoryLimit = getVMMemoryLimit(vm);

  if (!hasRiskyMemoryLimits(vm, vmi, guestMemory) || !memoryLimit) return null;

  return (
    <Alert
      actionLinks={
        <ExternalLink href={documentationURL.VM_MEMORY_RESOURCE_LIMITS} text={t('Learn more')} />
      }
      isInline={isInline}
      title={t('Memory limit is too low for the selected guest memory.')}
      variant={AlertVariant.warning}
    >
      {t('Current memory limit: {{limit}}.', {
        limit: readableSizeUnit(memoryLimit),
      })}
    </Alert>
  );
};

export default MemoryLimitsWarning;
