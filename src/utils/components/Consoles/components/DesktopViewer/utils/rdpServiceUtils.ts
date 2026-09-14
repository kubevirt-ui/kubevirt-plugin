import { ServiceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiCoreV1Pod,
  type IoK8sApiCoreV1Service,
  type IoK8sApiCoreV1ServicePort,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import {
  getServicesForVmi,
  getVMILabelForServiceSelector,
} from '@kubevirt-utils/resources/vmi/utils/services';
import { escapeJsonPointerToken, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sPatch, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_RDP_PORT } from './constants';
import { type ConsoleDetailPropType } from './types';

export const getServicePort = (
  service: IoK8sApiCoreV1Service,
  targetPort: number,
): IoK8sApiCoreV1ServicePort | undefined =>
  service?.spec?.ports?.find((servicePort) => targetPort === +servicePort.targetPort);

const findVMServiceWithPort = (
  vmi: V1VirtualMachineInstance,
  allServices: IoK8sApiCoreV1Service[],
  targetPort: number,
  pod?: IoK8sApiCoreV1Pod,
): IoK8sApiCoreV1Service | undefined => {
  if (!vmi) return undefined;

  const matchingServices = getServicesForVmi(allServices, pod, undefined, vmi);
  return matchingServices.find((service) => !!getServicePort(service, targetPort));
};

export const findRDPServiceAndPort = (
  vmi: V1VirtualMachineInstance,
  allServices: IoK8sApiCoreV1Service[],
  pod?: IoK8sApiCoreV1Pod,
): [IoK8sApiCoreV1Service | null, IoK8sApiCoreV1ServicePort | null] => {
  if (!vmi) {
    return [null, null];
  }
  const service = findVMServiceWithPort(vmi, allServices, DEFAULT_RDP_PORT, pod);
  return [service, getServicePort(service, DEFAULT_RDP_PORT)];
};

export const getRdpAddressPort = (
  vmi: V1VirtualMachineInstance,
  services: IoK8sApiCoreV1Service[],
  launcherPod: IoK8sApiCoreV1Pod,
): ConsoleDetailPropType => {
  const [rdpService, rdpPortObj] = findRDPServiceAndPort(vmi, services, launcherPod);

  if (!rdpService || !rdpPortObj) {
    return null;
  }

  let { port } = rdpPortObj;
  let address: string | undefined;
  switch (rdpService?.spec?.type) {
    case 'LoadBalancer':
      address = rdpService?.spec?.externalIPs?.[0];
      if (!address) {
        kubevirtConsole.warn(
          'External IP is not defined for the LoadBalancer RDP Service: ',
          rdpService,
        );
      }
      break;
    case 'NodePort':
      port = rdpPortObj?.nodePort ?? port;
      if (launcherPod) {
        address = launcherPod?.status?.hostIP;
      }
      if (!address) {
        kubevirtConsole.warn(
          'Node IP (launcherpod.status.hostIP) is not yet known for NodePort RDP Service: ',
          rdpService,
        );
      }
      break;
    default:
      kubevirtConsole.error('Unrecognized Service type: ', rdpService);
  }

  if (!address || !port) {
    return null;
  }

  kubevirtConsole.log('RDP requested for: ', address, port);
  return {
    address,
    port,
  };
};

export const createRDPService = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  pod?: IoK8sApiCoreV1Pod,
): Promise<K8sResourceCommon[]> => {
  const { namespace } = vm?.metadata ?? {};

  const labelSelector = getVMILabelForServiceSelector(pod, vm);

  const { labelKey, labelValue } = labelSelector;

  const vmPromise = k8sPatch<V1VirtualMachine>({
    data: [
      {
        op: 'add',
        path: `/spec/template/metadata/labels/${escapeJsonPointerToken(labelKey)}`,
        value: labelValue,
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });

  const vmiPromise = k8sPatch<V1VirtualMachineInstance>({
    data: [
      {
        op: 'add',
        path: `/metadata/labels/${escapeJsonPointerToken(labelKey)}`,
        value: labelValue,
      },
    ],
    model: VirtualMachineInstanceModel,
    resource: vmi,
  });

  const servicePromise = k8sCreate({
    data: {
      apiVersion: ServiceModel.apiVersion,
      kind: ServiceModel.kind,
      metadata: {
        name: `${vm?.metadata?.name}-rdp`,
        namespace: vm?.metadata?.namespace,
        ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
      },
      spec: {
        ports: [
          {
            port: DEFAULT_RDP_PORT,
            targetPort: DEFAULT_RDP_PORT,
          },
        ],
        selector: {
          [labelKey]: labelValue,
        },
        type: 'NodePort',
      },
    },
    model: ServiceModel,
    ns: namespace,
  });

  return Promise.all([vmPromise, vmiPromise, servicePromise]);
};
