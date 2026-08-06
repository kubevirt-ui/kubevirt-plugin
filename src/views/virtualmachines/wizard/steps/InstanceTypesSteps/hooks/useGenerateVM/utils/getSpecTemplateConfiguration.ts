import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  buildDefaultNetwork,
  buildDefaultNetworkInterface,
} from '@kubevirt-utils/resources/namespace/networkDefault';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import {
  HEADLESS_SERVICE_LABEL,
  HEADLESS_SERVICE_NAME,
} from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { type GenerateVMSpecTemplateConfiguration } from '../types';

import {
  getDomainDisks,
  getNoBootSourceVolumes,
  getTemplateVolumes,
} from './templateVolumeAndDisk';

type VMSpecTemplate = NonNullable<NonNullable<V1VirtualMachine['spec']>['template']>;

export const getSpecTemplateConfiguration = ({
  enableMultiArchBootImageImport,
  hasBootVolume,
  isIPv6SingleStack,
  isIso,
  isUDNManagedNamespace,
  populatedCloudInitYAML,
  selectedBootableVolume,
  selectedPreference,
  vmCreationNad,
  vmName,
  volumeName,
}: GenerateVMSpecTemplateConfiguration): VMSpecTemplate => {
  const defaultInterface = buildDefaultNetworkInterface({ isUDNManagedNamespace, vmCreationNad });
  const defaultNetwork = buildDefaultNetwork({ vmCreationNad });
  const isWindowsVM = Boolean(selectedPreference?.startsWith(OS_WINDOWS_PREFIX));
  const volumeArchitecture = getArchitecture(selectedBootableVolume);

  return {
    metadata: {
      labels: {
        ...(!isUDNManagedNamespace && {
          [HEADLESS_SERVICE_LABEL]: HEADLESS_SERVICE_NAME,
        }),
      },
    },
    spec: {
      ...(!isEmpty(volumeArchitecture) &&
        enableMultiArchBootImageImport && {
          architecture: volumeArchitecture,
        }),
      domain: {
        devices: {
          autoattachPodInterface: false,
          disks: hasBootVolume ? getDomainDisks(isIso, vmName) : [],
          interfaces: isIPv6SingleStack ? [] : [defaultInterface],
        },
      },
      networks: isIPv6SingleStack ? [] : [defaultNetwork],
      subdomain: HEADLESS_SERVICE_NAME,
      volumes: hasBootVolume
        ? getTemplateVolumes(volumeName, isIso, vmName, isWindowsVM, populatedCloudInitYAML)
        : getNoBootSourceVolumes(isWindowsVM, populatedCloudInitYAML),
    },
  };
};
