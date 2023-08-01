import React from 'react';
import { load } from 'js-yaml';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';

import {
  CloudInitNetworkData,
  CloudInitUserData,
  convertNetworkDataObjectToYAML,
  convertUserDataObjectToYAML,
  convertYAMLToNetworkDataObject,
  convertYAMLUserDataObject,
  createDefaultCloudInitYAML,
  deleteObjBlankValues,
  getCloudInitData,
  getCloudInitVolume,
} from './cloudinit-utils';
import { CLOUD_CONFIG_HEADER } from './consts';

export const useCloudInit = (vm: V1VirtualMachine): UseCloudInitValues => {
  const cloudInitVol = React.useMemo(() => getCloudInitVolume(vm), [vm]);
  const cloudInit = React.useMemo(() => getCloudInitData(cloudInitVol), [cloudInitVol]);

  const [userData, setUserData] = React.useState<CloudInitUserData>(
    convertYAMLUserDataObject(cloudInit?.userData ?? createDefaultCloudInitYAML()),
  );

  const [networkData, setNetworkData] = React.useState<CloudInitNetworkData>(
    convertYAMLToNetworkDataObject(cloudInit?.networkData ?? ''),
  );
  const [enableNetworkData, setEnableNetworkData] = React.useState<boolean>(
    !!networkData?.name || !!networkData?.address || !!networkData?.gateway,
  );

  const updateUserField = (key: keyof CloudInitUserData, value: string) => {
    setUserData({ ...userData, [key]: value });
  };
  const updateNetworkField = (key: keyof CloudInitNetworkData, value: string) => {
    setNetworkData({ ...networkData, [key]: value });
  };
  const updateFromYAML = (yaml: string) => {
    const cloudData = load(yaml) as {
      networkData?: string;
      userData?: string;
    };

    const yamlUserData = convertYAMLUserDataObject(cloudData?.userData);
    const yamlNetworkData = convertYAMLToNetworkDataObject(cloudData?.networkData);

    if (
      !yamlUserData &&
      !yamlNetworkData?.address &&
      !yamlNetworkData.gateway &&
      !yamlNetworkData.name
    )
      throw new Error('Invalid YAML');

    setUserData(yamlUserData);
    setNetworkData(yamlNetworkData);
  };

  const shouldAddHeader = React.useMemo(() => {
    const firstLineSepIndex = cloudInit?.userData ? cloudInit?.userData.indexOf('\n') : -1;
    const header =
      firstLineSepIndex === -1 ? undefined : cloudInit?.userData.substring(0, firstLineSepIndex);

    return header?.trimEnd() === CLOUD_CONFIG_HEADER;
  }, [cloudInit?.userData]);

  const cloudInitVolume: V1Volume = React.useMemo(() => {
    const cloudInitNoBlanks = deleteObjBlankValues({
      networkData: enableNetworkData ? convertNetworkDataObjectToYAML(networkData) : null,
      userData: convertUserDataObjectToYAML(userData, shouldAddHeader),
    });

    if (cloudInitVol?.cloudInitConfigDrive) {
      return {
        cloudInitConfigDrive: cloudInitNoBlanks,
        name: 'cloudinitdisk',
      };
    }

    return {
      cloudInitNoCloud: cloudInitNoBlanks,
      name: 'cloudinitdisk',
    };
  }, [userData, shouldAddHeader, networkData, cloudInitVol, enableNetworkData]);

  const updatedVM = React.useMemo(
    () =>
      produceVMDisks(vm, (vmDraft) => {
        const cloudInitDiskName = cloudInitVol?.name || 'cloudinitdisk';

        const cloudInitDisk = vmDraft.spec.template.spec.domain.devices.disks.find(
          (disk) => disk.name === cloudInitDiskName,
        );

        // cloudinitdisk deleted or doesn't exist, we need to re-create it
        if (!cloudInitDisk) {
          vmDraft.spec.template.spec.domain.devices.disks.push({
            disk: {
              bus: 'virtio',
            },
            name: cloudInitDiskName,
          });
        }

        const otherVolumes = getVolumes(vmDraft).filter(
          (vol) => !vol.cloudInitNoCloud && !vol.cloudInitConfigDrive,
        );
        vmDraft.spec.template.spec.volumes = [...otherVolumes, cloudInitVolume];
      }),
    [vm, cloudInitVol?.name, cloudInitVolume],
  );

  return {
    cloudInitVolume,
    enableNetworkData,
    networkData,
    setEnableNetworkData,
    updatedVM,

    updateFromYAML,
    updateNetworkField,
    // methods
    updateUserField,
    userData,
  };
};

type UseCloudInitValues = {
  cloudInitVolume: V1Volume;
  enableNetworkData: boolean;
  networkData: CloudInitNetworkData;
  setEnableNetworkData: (enableNetwork: boolean) => void;
  updatedVM: V1VirtualMachine;
  updateFromYAML: (yaml: string) => void;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string) => void;
  updateUserField: (key: keyof CloudInitUserData, value: string) => void;
  userData: CloudInitUserData;
};
