import { V1Interface } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { VirtualMachineInstancetypeModel } from '@kubevirt-utils/models';
import { isBootableVolumeISO } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getPVCStorageClassName } from '@kubevirt-utils/resources/bootableresources/selectors';
import { getLabel, getLabels } from '@kubevirt-utils/resources/shared';
import {
  DEFAULT_NETWORK_INTERFACE,
  getDefaultRunningStrategy,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { GenerateVMSpecConfiguration, GenerateVMSpecTemplateConfiguration } from '../types';
import { getDataVolumeTemplates } from './generateVMSpecTemplateConfig';

import { DEFAULT_NETWORK } from '@kubevirt-utils/resources/vm';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import {
  HEADLESS_SERVICE_LABEL,
  HEADLESS_SERVICE_NAME,
} from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getDomainDisks, getTemplateVolumes } from './templateVolumeAndDisk';

const getSpecTemplateConfiguration = ({
  isUDNManagedNamespace,
  enableMultiArchBootImageImport,
  isIPv6SingleStack,
  isIso,
  vmName,
  selectedPreference,
  populatedCloudInitYAML,
  volumeName,
  selectedBootableVolume,
}: GenerateVMSpecTemplateConfiguration) => {
  const defaultInterface = isUDNManagedNamespace
    ? ({ binding: { name: UDN_BINDING_NAME }, name: DEFAULT_NETWORK_INTERFACE.name } as V1Interface)
    : DEFAULT_NETWORK_INTERFACE;

  const isWindowsVM = selectedPreference?.startsWith(OS_WINDOWS_PREFIX);

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
          disks: getDomainDisks(isIso, vmName),
          interfaces: isIPv6SingleStack ? [] : [defaultInterface],
        },
      },
      networks: isIPv6SingleStack ? [] : [DEFAULT_NETWORK],
      subdomain: HEADLESS_SERVICE_NAME,
      volumes: getTemplateVolumes(volumeName, isIso, vmName, isWindowsVM, populatedCloudInitYAML),
    },
  };
};

export const getSpecConfiguration = ({
  selectedBootableVolume,
  dvSource,
  pvcSource,
  customDiskSize,
  vmName,
  selectedInstanceType,
  enableMultiArchBootImageImport,
  isIPv6SingleStack,
  populatedCloudInitYAML,
  isUDNManagedNamespace,
}: GenerateVMSpecConfiguration) => {
  const selectedPreference = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  const selectPreferenceKind = getLabel(
    selectedBootableVolume,
    DEFAULT_PREFERENCE_KIND_LABEL,
    null,
  );
  const isIso = isBootableVolumeISO(selectedBootableVolume);
  const storageClassName = getPVCStorageClassName(pvcSource);
  const volumeName = `${vmName}-volume`;

  return {
    dataVolumeTemplates: getDataVolumeTemplates({
      volumeName,
      selectedBootableVolume,
      dvSource,
      pvcSource,
      customDiskSize,
      isIso,
      storageClassName,
      vmName,
    }),
    instancetype: {
      ...(selectedInstanceType?.namespace && {
        kind: VirtualMachineInstancetypeModel.kind,
      }),
      name:
        selectedInstanceType?.name ||
        getLabels(selectedBootableVolume)?.[DEFAULT_INSTANCETYPE_LABEL],
    },
    preference: {
      name: selectedPreference,
      ...(selectPreferenceKind && { kind: selectPreferenceKind }),
    },
    runStrategy: getDefaultRunningStrategy(),
    template: getSpecTemplateConfiguration({
      enableMultiArchBootImageImport,
      isIPv6SingleStack,
      isIso,
      vmName,
      selectedPreference,
      populatedCloudInitYAML,
      selectedBootableVolume,
      volumeName,
      isUDNManagedNamespace,
    }),
  };
};
