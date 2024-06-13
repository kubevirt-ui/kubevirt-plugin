import { V1VirtualMachineInstanceSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

/**
 * Get node selectors presentation
 * @date 3/14/2022 - 1:02:01 PM
 *
 * @param {V1VirtualMachineInstanceSpec['nodeSelector']} nodeSelector - node selectors
 * @returns {string}
 */
export const getNodeSelectorLabel = (
  nodeSelector: null | V1VirtualMachineInstanceSpec['nodeSelector'],
): string =>
  !isEmpty(nodeSelector) &&
  Object.entries(nodeSelector)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
