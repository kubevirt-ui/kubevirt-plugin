import {
  NetworkMapModel,
  ProviderModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
} from '@forklift-ui/types';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import {
  CCLM_LABEL_KEY,
  CCLM_LABEL_VALUE,
  MTV_MIGRATION_NAMESPACE,
  POD_NETWORK_TYPE,
} from './constants';

export const getNADNameAndNamespace = (
  nad: string,
  defaultNamespace?: string,
): { name: string; namespace: string | undefined } => {
  const splittedName = nad.split('/');

  const nadNamespace = splittedName.length > 1 ? splittedName[0] : defaultNamespace;
  const nadName = splittedName.length > 1 ? splittedName[1] : nad;

  return {
    name: nadName,
    namespace: nadNamespace,
  };
};

export const getInitialNetworkMap = (
  vms: V1VirtualMachine[],
  targetNADs: NetworkAttachmentDefinitionKind[],
): V1beta1NetworkMap => {
  const sourceNamespace = getNamespace(vms?.[0]);
  const networks = vms
    .map((vm) => getNetworks(vm)?.filter((network) => network.multus?.networkName))
    .filter(Boolean)
    .flat();

  return {
    apiVersion: `${NetworkMapModel.apiGroup}/${NetworkMapModel.apiVersion}`,
    kind: NetworkMapModel.kind,
    metadata: {
      labels: {
        [CCLM_LABEL_KEY]: CCLM_LABEL_VALUE,
      },
      name: `cross-cluster-migration-${getRandomChars()}`,
      namespace: MTV_MIGRATION_NAMESPACE,
    },
    spec: {
      map: [
        {
          destination: {
            type: POD_NETWORK_TYPE,
          },
          source: {
            type: POD_NETWORK_TYPE,
          },
        },
        ...networks.map((network): V1beta1NetworkMapSpecMap => {
          const { name, namespace } = getNADNameAndNamespace(
            network?.multus?.networkName,
            sourceNamespace,
          );

          const targetNAD = targetNADs.find(
            (nad) => getName(nad) === name && getNamespace(nad) === namespace,
          );

          return {
            destination: {
              name: getName(targetNAD),
              namespace: getNamespace(targetNAD),
              type: 'multus',
            },
            source: {
              name: name,
              namespace: namespace,
              type: 'multus',
            },
          };
        }),
      ],

      provider: {
        destination: {
          apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
          kind: ProviderModel.kind,
          namespace: MTV_MIGRATION_NAMESPACE,
        },
        source: {
          apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
          kind: ProviderModel.kind,
          namespace: MTV_MIGRATION_NAMESPACE,
        },
      },
    },
  };
};
