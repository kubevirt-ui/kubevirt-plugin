import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_INSTANCETYPE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { VirtualMachineInstancetypeModel } from '@kubevirt-utils/models';
import { isBootableVolumeISO } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getPVCStorageClassName } from '@kubevirt-utils/resources/bootableresources/selectors';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { getDefaultRunningStrategy } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { type GenerateVMSpecConfiguration } from '../types';

import { getDataVolumeTemplates } from './generateVMSpecTemplateConfig';
import { getSelectedPreferenceMatcher } from './getSelectedPreference';
import { getSpecTemplateConfiguration } from './getSpecTemplateConfiguration';

type VMSpec = NonNullable<V1VirtualMachine['spec']>;

export const getSpecConfiguration = ({
  context,
  instanceTypeData,
}: GenerateVMSpecConfiguration): VMSpec => {
  const {
    customDiskSize,
    dvSource,
    preference,
    pvcSource,
    selectedBootableVolume,
    selectedInstanceType,
    useBootSource,
  } = instanceTypeData;
  const {
    enableMultiArchBootImageImport,
    isIPv6SingleStack,
    isUDNManagedNamespace,
    populatedCloudInitYAML,
    vmCreationNad,
    vmName,
  } = context;

  const { kind: selectPreferenceKind, name: selectedPreference } = getSelectedPreferenceMatcher(
    selectedBootableVolume,
    preference,
  );
  const instanceTypeName =
    selectedInstanceType?.name ?? getLabels(selectedBootableVolume)?.[DEFAULT_INSTANCETYPE_LABEL];
  const hasBootVolume = useBootSource && !isEmpty(selectedBootableVolume);
  const isIso = hasBootVolume && isBootableVolumeISO(selectedBootableVolume);
  const storageClassName = getPVCStorageClassName(pvcSource);
  const volumeName = `${vmName}-volume`;

  return {
    ...(hasBootVolume &&
      selectedBootableVolume && {
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
      }),
    ...(instanceTypeName && {
      instancetype: {
        ...(selectedInstanceType?.namespace && {
          kind: VirtualMachineInstancetypeModel.kind,
        }),
        name: instanceTypeName,
      },
    }),
    ...(selectedPreference && {
      preference: {
        name: selectedPreference,
        ...(selectPreferenceKind && { kind: selectPreferenceKind }),
      },
    }),
    runStrategy: getDefaultRunningStrategy(),
    template: getSpecTemplateConfiguration({
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
    }),
  };
};
