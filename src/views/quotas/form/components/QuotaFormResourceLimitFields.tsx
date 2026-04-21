import React, { FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ApplicationAwareResourceQuota,
  CalculationMethod,
} from '@kubevirt-utils/resources/quotas/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Flex, Stack } from '@patternfly/react-core';

import useAAQCalculationMethod from '../../hooks/useAAQCalculationMethod';
import { getMainResourceKeys, getSpecLimits } from '../../utils/utils';

import QuotaFormResourceLimitInput from './QuotaFormResourceLimitInput';

type QuotaFormResourceLimitFieldsProps = {
  formData: ApplicationAwareResourceQuota;
  updateHardValue: (key: string, value: number, unit?: string) => void;
};

const QuotaFormResourceLimitFields: FC<QuotaFormResourceLimitFieldsProps> = ({
  formData,
  updateHardValue,
}) => {
  const { t } = useKubevirtTranslation();
  const calculationMethod = useAAQCalculationMethod();
  const hasPodOverhead = calculationMethod === CalculationMethod.VmiPodUsage;

  const { cpu, memory, vmiCount } = getMainResourceKeys(
    calculationMethod === CalculationMethod.DedicatedVirtualResources,
  );

  const parseHardValue = (val: string): number => (isEmpty(val) ? NaN : parseInt(val));

  const cpuLimit = parseHardValue(getSpecLimits(formData)?.[cpu]);
  const memoryLimit = parseHardValue(getSpecLimits(formData)?.[memory]);
  const vmiCountLimit = parseHardValue(getSpecLimits(formData)?.[vmiCount]);

  return (
    <Stack hasGutter>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <QuotaFormResourceLimitInput
          tooltipText={
            hasPodOverhead
              ? t(
                  'The maximum number of CPU cores permitted for pods that run VM workloads. Resource usage includes both the VM and pod overhead.',
                )
              : t(
                  'The maximum number of virtual CPUs permitted for all VMs in this project, excluding pod overhead.',
                )
          }
          placeholder={t('i.e., 8')}
          promptType={hasPodOverhead ? OLSPromptType.CPU_ALLOCATION : OLSPromptType.VCPU_ALLOCATION}
          resourceKey={cpu}
          resourceLimitLabel={hasPodOverhead ? t('CPU allocation') : t('vCPU allocation')}
          setValue={(value) => updateHardValue(cpu, value)}
          unitLabel={hasPodOverhead ? t('CPU') : t('vCPU')}
          value={cpuLimit}
        />
        <QuotaFormResourceLimitInput
          promptType={
            hasPodOverhead
              ? OLSPromptType.MEMORY_ALLOCATION
              : OLSPromptType.VIRTUAL_MEMORY_ALLOCATION
          }
          resourceLimitLabel={
            hasPodOverhead ? t('Memory allocation') : t('Virtual memory allocation')
          }
          tooltipText={
            hasPodOverhead
              ? t(
                  'The maximum memory capacity (GiB) permitted for pods that run VM workloads. Resource usage includes both the VM and pod overhead.',
                )
              : t(
                  'The maximum memory capacity (GiB) permitted for all VMs in this project, excluding pod overhead.',
                )
          }
          placeholder={t('i.e., 16')}
          resourceKey={memory}
          setValue={(value) => updateHardValue(memory, value, 'Gi')}
          unitLabel={t('GiB')}
          value={memoryLimit}
        />
        <QuotaFormResourceLimitInput
          tooltipText={t(
            'The maximum number of actively running virtual machine instances permitted in this project.',
          )}
          placeholder={t('i.e., 4')}
          promptType={OLSPromptType.VMI_LIMITS}
          resourceKey={vmiCount}
          resourceLimitLabel={t('VMI limits')}
          setValue={(value) => updateHardValue(vmiCount, value)}
          unitLabel={t('VMIs')}
          value={vmiCountLimit}
        />
      </Flex>
      <FormGroupHelperText>
        {t(
          'Additional workload limits (such as pods) can be added later using advanced configuration',
        )}
      </FormGroupHelperText>
    </Stack>
  );
};

export default QuotaFormResourceLimitFields;
