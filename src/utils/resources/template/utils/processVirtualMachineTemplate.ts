import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { V1alpha1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { VirtualMachineTemplateModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getKubevirtBaseAPIPath } from '@multicluster/k8sRequests';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { NAME_PARAMETER } from './constants';
import { generateVMName } from './helpers';
import { getParameters } from './selectors';
import { ProcessedVirtualMachineTemplate, ProcessOptions } from './types';

const API_GROUP_VERSION = 'subresources.template.kubevirt.io/v1alpha1';

const buildParameterOverrides = (
  template: V1alpha1VirtualMachineTemplate,
  vmName?: string,
): Record<string, string> => {
  const overrides: Record<string, string> = {};

  for (const param of getParameters(template) ?? []) {
    if (param.name === NAME_PARAMETER) {
      overrides.NAME = vmName || generateVMName(template);
    } else if (param.value) {
      overrides[param.name] = param.value;
    }
  }

  return overrides;
};

export const processVirtualMachineTemplate = async (
  template: V1alpha1VirtualMachineTemplate,
  cluster?: string,
  vmName?: string,
): Promise<V1VirtualMachine> => {
  const basePath = await getKubevirtBaseAPIPath(cluster);
  const url = `${basePath}/apis/${API_GROUP_VERSION}/namespaces/${getNamespace(template)}/${
    VirtualMachineTemplateModel.plural
  }/${getName(template)}/process`;

  const processOptions: ProcessOptions = {
    apiVersion: API_GROUP_VERSION,
    kind: 'ProcessOptions',
    parameters: buildParameterOverrides(template, vmName),
  };

  const response = await consoleFetch(url, {
    body: JSON.stringify(processOptions),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  const result: ProcessedVirtualMachineTemplate = await response.json();

  if (cluster) result.virtualMachine.cluster = cluster;

  return result.virtualMachine;
};
