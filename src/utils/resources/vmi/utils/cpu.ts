import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';

/**
 * Get cpu cores count
 * @date 3/14/2022 - 1:02:59 PM
 *
 * @param {V1CPU} sourceCPU
 * @returns {number}
 */
export const getCPUCount = (sourceCPU: V1CPU): number => {
  return sourceCPU?.cores || 1;
};
