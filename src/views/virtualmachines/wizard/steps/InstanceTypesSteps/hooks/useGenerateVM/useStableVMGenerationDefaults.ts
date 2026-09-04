import { useCallback, useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';

import { type RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { createPopulatedCloudInitYAML } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';

type StableVMGenerationDefaults = {
  populatedCloudInitYAML: string;
  vmName: string;
};

type UseStableVMGenerationDefaultsArgs = {
  autoUpdateEnabled?: boolean;
  name: VMWizardFormValues['vmData']['name'];
  osLabel?: string;
  selectedPreference?: string;
  subscriptionData: RHELAutomaticSubscriptionData;
};

export const useStableVMGenerationDefaults = ({
  autoUpdateEnabled,
  name,
  osLabel,
  selectedPreference,
  subscriptionData,
}: UseStableVMGenerationDefaultsArgs): (() => StableVMGenerationDefaults) => {
  const source = useMemo(
    () => ({ autoUpdateEnabled, osLabel, selectedPreference, subscriptionData }),
    [autoUpdateEnabled, osLabel, selectedPreference, subscriptionData],
  );
  const cloudInitDefaultsRef = useRef<{
    source: typeof source;
    yaml: string;
  }>();
  const generatedVMNameRef = useRef<{ osLabel?: string; vmName: string }>();

  return useCallback(() => {
    if (!isEqual(cloudInitDefaultsRef.current?.source, source)) {
      cloudInitDefaultsRef.current = {
        source,
        yaml: createPopulatedCloudInitYAML(
          source.selectedPreference,
          source.osLabel,
          source.subscriptionData,
          source.autoUpdateEnabled,
        ),
      };
    }

    if (
      !name &&
      (!generatedVMNameRef.current || generatedVMNameRef.current.osLabel !== source.osLabel)
    ) {
      generatedVMNameRef.current = {
        osLabel: source.osLabel,
        vmName: generatePrettyName(source.osLabel),
      };
    }

    return {
      populatedCloudInitYAML: cloudInitDefaultsRef.current.yaml,
      vmName: name ?? generatedVMNameRef.current.vmName,
    };
  }, [name, source]);
};
