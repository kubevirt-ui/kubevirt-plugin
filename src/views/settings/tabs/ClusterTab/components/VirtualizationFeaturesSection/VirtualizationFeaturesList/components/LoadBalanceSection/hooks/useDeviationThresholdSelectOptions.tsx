import { useMemo } from 'react';

import { getDeviationThreshold } from '@kubevirt-utils/resources/descheduler/selectors';
import { KubeDescheduler } from '@kubevirt-utils/resources/descheduler/types';
import { SimpleSelectOption } from '@patternfly/react-templates';

import { deviationThresholdOptions } from '../constants';

export const useDeviationThresholdSelectOptions = (
  descheduler: KubeDescheduler,
): SimpleSelectOption[] => {
  return useMemo(() => {
    const selectedLevel = getDeviationThreshold(descheduler);

    return deviationThresholdOptions.map((threshold) => ({
      content: threshold.value,
      description: threshold.description,
      selected: threshold.value === selectedLevel,
      value: threshold.value,
    }));
  }, [descheduler]);
};
