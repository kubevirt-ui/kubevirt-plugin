import React from 'react';
import { load } from 'js-yaml';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import {
  V1CloudInitNoCloudSource,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';

import {
  CloudInitNetworkData,
  CloudInitUserData,
  convertNetworkDataObjectToYAML,
  convertUserDataObjectToYAML,
  convertYAMLToNetworkDataObject,
  convertYAMLUserDataObject,
  deleteObjBlankValues,
  getCloudInitData,
  getCloudInitVolume,
} from './cloudinit-utils';
import { CLOUD_CONFIG_HEADER } from './consts';

export const useCloudInit = (vm: V1VirtualMachine): UseCloudInitValues => {
  const cloudInitVolume = getCloudInitVolume(vm);
  const cloudInit = getCloudInitData(cloudInitVolume);

  const [userData, setUserData] = React.useState<CloudInitUserData>(
    convertYAMLUserDataObject(cloudInit?.userData),
  );

  const [networkData, setNetworkData] = React.useState<CloudInitNetworkData>(
    convertYAMLToNetworkDataObject(cloudInit?.networkData),
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
      userData?: string;
      networkData?: string;
    };

    setUserData(convertYAMLUserDataObject(cloudData?.userData));
    setNetworkData(convertYAMLToNetworkDataObject(cloudData?.networkData));
  };

  const shouldAddHeader = React.useMemo(() => {
    const firstLineSepIndex = cloudInit?.userData ? cloudInit?.userData.indexOf('\n') : -1;
    const header =
      firstLineSepIndex === -1 ? undefined : cloudInit?.userData.substring(0, firstLineSepIndex);

    return header?.trimEnd() === CLOUD_CONFIG_HEADER;
  }, [cloudInit?.userData]);

  const shouldUpdateUser = React.useMemo(() => {
    const initData = convertYAMLUserDataObject(cloudInit?.userData);
    return (
      userData?.user !== initData?.user ||
      userData?.password !== initData?.password ||
      userData?.hostname !== initData?.hostname
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const shouldUpdateNetwork = React.useMemo(() => {
    const initData = convertYAMLToNetworkDataObject(cloudInit?.networkData);
    return (
      enableNetworkData &&
      (networkData?.name !== initData?.name ||
        !!networkData?.address ||
        networkData?.gateway !== initData?.gateway)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkData, enableNetworkData]);

  const updatedCloudinitVolume: V1Volume = React.useMemo(
    () => {
      // if network form checkbox is unchecked, we should remove network data from cloudinit
      const resetNetworkData = enableNetworkData ? cloudInit?.networkData : undefined;

      const cloudInitNoCloud: V1CloudInitNoCloudSource = {
        userData: shouldUpdateUser
          ? convertUserDataObjectToYAML(userData, shouldAddHeader)
          : cloudInit?.userData,
        networkData: shouldUpdateNetwork
          ? convertNetworkDataObjectToYAML(networkData)
          : resetNetworkData,
      };

      return {
        name: 'cloudinitdisk',
        cloudInitNoCloud: deleteObjBlankValues(cloudInitNoCloud),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [networkData, userData, enableNetworkData],
  );

  const updatedVM = React.useMemo(
    () =>
      produceVMDisks(vm, (vmDraft) => {
        const cloudInitDiskName = 'cloudinitdisk';

        const cloudInitDisk = vmDraft.spec.template.spec.domain.devices.disks.find(
          (disk) => disk.name === cloudInitDiskName,
        );

        // cloudinitdisk deleted or doesn't exist, we need to re-create it
        if (!cloudInitDisk) {
          vmDraft.spec.template.spec.domain.devices.disks.push({
            name: cloudInitDiskName,
            disk: {
              bus: 'virtio',
            },
          });
        }

        const otherVolumes = getVolumes(vmDraft).filter(
          (vol) => !vol.cloudInitNoCloud && !vol.cloudInitConfigDrive,
        );
        vmDraft.spec.template.spec.volumes = [...otherVolumes, updatedCloudinitVolume];
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [networkData, userData, updatedCloudinitVolume],
  );

  return {
    userData,
    enableNetworkData,
    networkData,
    updatedCloudinitVolume,
    updatedVM,

    // methods
    updateUserField,
    updateNetworkField,
    updateFromYAML,
    setEnableNetworkData,
  };
};

type UseCloudInitValues = {
  userData: CloudInitUserData;
  enableNetworkData: boolean;
  networkData: CloudInitNetworkData;
  updatedCloudinitVolume: V1Volume;
  updatedVM: V1VirtualMachine;
  updateUserField: (key: keyof CloudInitUserData, value: string) => void;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string) => void;
  updateFromYAML: (yaml: string) => void;
  setEnableNetworkData: (enableNetwork: boolean) => void;
};
