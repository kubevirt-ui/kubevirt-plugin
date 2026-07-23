import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { VirtualMachineInstancetypeModel } from '@kubevirt-utils/models';
import { isBootableVolumeISO } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getPVCStorageClassName } from '@kubevirt-utils/resources/bootableresources/selectors';
import {
  buildDefaultNetwork,
  buildDefaultNetworkInterface,
} from '@kubevirt-utils/resources/namespace/networkDefault';
import { getLabel, getLabels } from '@kubevirt-utils/resources/shared';
import { getDefaultRunningStrategy } from '@kubevirt-utils/resources/vm';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import {
  HEADLESS_SERVICE_LABEL,
  HEADLESS_SERVICE_NAME,
} from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  type GenerateVMSpecConfiguration,
  type GenerateVMSpecTemplateConfiguration,
} from '../types';

import { getDataVolumeTemplates } from './generateVMSpecTemplateConfig';
import { getDomainDisks, getTemplateVolumes } from './templateVolumeAndDisk';

type VMSpecTemplate = NonNullable<NonNullable<V1VirtualMachine['spec']>['template']>;
type VMSpec = NonNullable<V1VirtualMachine['spec']>;

const getSpecTemplateConfiguration = ({
  enableMultiArchBootImageImport,
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
      networks: isIPv6SingleStack ? [] : [defaultNetwork],
      subdomain: HEADLESS_SERVICE_NAME,
      volumes: getTemplateVolumes(volumeName, isIso, vmName, isWindowsVM, populatedCloudInitYAML),
    },
  };
};

export const getSpecConfiguration = ({
  customDiskSize,
  dvSource,
  enableMultiArchBootImageImport,
  isIPv6SingleStack,
  isUDNManagedNamespace,
  populatedCloudInitYAML,
  pvcSource,
  selectedBootableVolume,
  selectedInstanceType,
  vmCreationNad,
  vmName,
}: GenerateVMSpecConfiguration): VMSpec => {
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
      customDiskSize,
      dvSource,
      isIso,
      pvcSource,
      selectedBootableVolume,
      storageClassName,
      vmName,
      volumeName,
    }),
    instancetype: {
      ...(selectedInstanceType?.namespace && {
        kind: VirtualMachineInstancetypeModel.kind,
      }),
      name:
        selectedInstanceType?.name ??
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
      isUDNManagedNamespace,
      populatedCloudInitYAML,
      selectedBootableVolume,
      selectedPreference,
      vmCreationNad,
      vmName,
      volumeName,
    }),
  };
};
