import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { InstanceTypeSize } from '../components/SelectInstanceTypeSection/utils/types';
import { categoryNamePrefixMatcher } from '../components/SelectInstanceTypeSection/utils/utils';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
  InstanceTypeState,
} from './constants';

const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

const getCloudInitUserNameByOS = (selectedPreferenceName: string): string => {
  const osPrefix = selectedPreferenceName?.split('.');
  if (osPrefix?.[0].startsWith(OS_NAME_TYPES.rhel)) return 'cloud-user';
  if (osPrefix?.[0].startsWith(OS_NAME_TYPES.centos)) return 'centos';
  return 'fedora';
};

export const getInstanceTypeState = (defaultInstanceTypeName: string): InstanceTypeState => {
  const [prefix, size] = defaultInstanceTypeName?.split('.');
  const category = categoryNamePrefixMatcher[prefix];
  return {
    category,
    size: size as InstanceTypeSize,
    name: defaultInstanceTypeName,
  };
};

export const generateVM = (
  dataSource: V1beta1DataSource,
  activeNamespace: string,
  instanceTypeName: string,
  vmName?: string,
  storageClassName?: string,
) => {
  const virtualmachineName =
    vmName ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
    });

  const targetNamespace =
    activeNamespace !== ALL_NAMESPACES_SESSION_KEY ? activeNamespace : DEFAULT_NAMESPACE;

  const selectedPreference = dataSource?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];

  const cloudInitUserName = getCloudInitUserNameByOS(selectedPreference);

  const emptyVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    metadata: {
      name: virtualmachineName,
      namespace: targetNamespace,
    },
    spec: {
      running: true,
      template: {
        spec: {
          domain: {
            devices: {
              disks: [
                {
                  disk: {
                    bus: 'virtio',
                  },
                  name: `${virtualmachineName}-disk`,
                },
                {
                  disk: {
                    bus: 'virtio',
                  },
                  name: 'cloudinitdisk',
                },
              ],
            },
          },
          volumes: [
            {
              dataVolume: { name: `${virtualmachineName}-volume` },
              name: `${virtualmachineName}-disk`,
            },
            {
              cloudInitNoCloud: {
                userData: `#cloud-config\nuser: ${cloudInitUserName}\npassword: ${generateCloudInitPassword()}\nchpasswd: { expire: False }`,
              },
              name: 'cloudinitdisk',
            },
          ],
        },
      },
      instancetype: {
        name: instanceTypeName || dataSource?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        name: selectedPreference,
      },
      dataVolumeTemplates: [
        {
          metadata: {
            name: `${virtualmachineName}-volume`,
          },
          spec: {
            sourceRef: {
              kind: DataSourceModel.kind,
              name: dataSource?.metadata?.name,
              namespace: dataSource?.metadata?.namespace,
            },
            storage: {
              storageClassName,
              resources: { requests: { storage: '' } },
            },
          },
        },
      ],
    },
  };

  return emptyVM;
};
