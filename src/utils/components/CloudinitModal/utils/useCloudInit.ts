import { useEffect, useMemo, useState } from 'react';
import { load } from 'js-yaml';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import {
  V1CloudInitNoCloudSource,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { getVolumes } from '@kubevirt-utils/resources/vm';

import {
  CloudInitNetworkData,
  CloudInitUserData,
  convertNetworkDataObjectToYAML,
  convertUserDataObjectToYAML,
  convertYAMLToNetworkDataObject,
  convertYAMLUserDataObject,
  createDefaultCloudInitYAML,
  getCloudInitData,
  getCloudInitVolume,
} from './cloudinit-utils';

export const useCloudInit = (vm: V1VirtualMachine): UseCloudInitValues => {
  const cloudInitVol = useMemo(() => getCloudInitVolume(vm), [vm]);
  const cloudInit = useMemo(
    () => <V1CloudInitNoCloudSource>getCloudInitData(cloudInitVol) || createDefaultCloudInitYAML(),
    [cloudInitVol],
  );

  const [yamlJSObject, setYamlJSObject] = useState<V1CloudInitNoCloudSource>(cloudInit);

  const [userData, setUserData] = useState<CloudInitUserData>();

  const [networkData, setNetworkData] = useState<CloudInitNetworkData>();
  const [latestNetworkData, setLatestNetworkData] = useState<CloudInitNetworkData>();
  const [enableNetworkData, setEnableNetworkData] = useState<boolean>();

  const wrappedSetEnableNetworkData = (checked: boolean): void => {
    setLatestNetworkData(networkData);
    setYamlJSObject((yaml) => {
      const { networkData: _ = '', ...restYaml } = yaml || {};
      const ntData = convertNetworkDataObjectToYAML(latestNetworkData || networkData);
      return checked
        ? {
            ...yaml,
            ...(ntData && { networkData: ntData }),
          }
        : restYaml;
    });

    setEnableNetworkData(checked);
  };

  const updateUserField = (key: keyof CloudInitUserData, value: string): void => {
    setYamlJSObject((yamlObj) => {
      return {
        ...yamlObj,
        userData: convertUserDataObjectToYAML({ ...userData, [key]: value }, true),
      };
    });
  };
  const updateNetworkField = (key: keyof CloudInitNetworkData, value: string): void => {
    setYamlJSObject((yamlObj) => {
      const ntData = convertNetworkDataObjectToYAML({
        ...convertYAMLToNetworkDataObject(yamlObj?.networkData),
        [key]: value,
      });
      const { networkData: _, ...restYaml } = yamlObj || {};
      return {
        ...restYaml,
        ...(ntData && { networkData: ntData }),
      };
    });
  };

  const updateFromYAML = (yaml: string) => {
    const cloudData = <V1CloudInitNoCloudSource>load(yaml);
    setYamlJSObject(cloudData);
  };

  useEffect(() => {
    const networkDataObj =
      yamlJSObject?.networkData && convertYAMLToNetworkDataObject(yamlJSObject?.networkData);

    networkDataObj && setEnableNetworkData(true);
    setNetworkData(networkDataObj);

    const userDataObj = yamlJSObject?.userData && convertYAMLUserDataObject(yamlJSObject?.userData);

    setUserData(userDataObj);
  }, [yamlJSObject]);

  const cloudInitVolume: V1Volume = useMemo(
    () => ({
      cloudInitNoCloud: yamlJSObject,
      name: 'cloudinitdisk',
    }),
    [yamlJSObject],
  );

  const updatedVM = useMemo(
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
              bus: InterfaceTypes.VIRTIO,
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
    setEnableNetworkData: wrappedSetEnableNetworkData,
    updatedVM,
    updateFromYAML,
    updateNetworkField,
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
