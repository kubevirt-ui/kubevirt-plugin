import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getMaxSuffixLength,
  getMaxVMNameLength,
} from '@kubevirt-utils/components/SnapshotModal/utils/utils';
import { getLongestNameLength } from '@kubevirt-utils/resources/shared';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';

export const useSuffixValidation = (vms: V1VirtualMachine[], snapshotSuffix: string) => {
  const maxSuffixLength = useMemo(() => getMaxSuffixLength(getLongestNameLength(vms)), [vms]);
  const maxVMNameLength = getMaxVMNameLength(snapshotSuffix.length);

  const isSuffixValidLength = snapshotSuffix.length <= maxSuffixLength;
  const isSuffixValidDNS1123Label = useMemo(() => isDNS1123Label(snapshotSuffix), [snapshotSuffix]);
  const isSuffixValid = snapshotSuffix && isSuffixValidLength && isSuffixValidDNS1123Label;

  return {
    isSuffixValid,
    isSuffixValidDNS1123Label,
    isSuffixValidLength,
    maxSuffixLength,
    maxVMNameLength,
  };
};
