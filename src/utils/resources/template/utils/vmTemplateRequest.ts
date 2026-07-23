import { VirtualMachineTemplateRequestModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1beta1VirtualMachineTemplateRequest } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { TEMPLATE_CATEGORY_LABEL } from './constants';

export type CreateVMTemplateRequestOptions = {
  category?: string;
  templateName: string;
  templateNamespace: string;
  vm: V1VirtualMachine;
};

export const createVMTemplateRequest = async ({
  category,
  templateName,
  templateNamespace,
  vm,
}: CreateVMTemplateRequestOptions): Promise<V1beta1VirtualMachineTemplateRequest> => {
  const cluster = getCluster(vm);

  const vmTemplateRequest: V1beta1VirtualMachineTemplateRequest = {
    apiVersion: `${VirtualMachineTemplateRequestModel.apiGroup}/${VirtualMachineTemplateRequestModel.apiVersion}`,
    kind: VirtualMachineTemplateRequestModel.kind,
    metadata: {
      name: templateName,
      namespace: templateNamespace,
    },
    spec: {
      templateName,
      ...(!isEmpty(category) && {
        templateLabels: { [TEMPLATE_CATEGORY_LABEL]: category },
      }),
      virtualMachineRef: {
        name: getName(vm),
        namespace: getNamespace(vm),
      },
    },
  };

  return kubevirtK8sCreate({
    cluster,
    data: vmTemplateRequest,
    model: VirtualMachineTemplateRequestModel,
  });
};
