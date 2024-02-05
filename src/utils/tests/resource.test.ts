import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { DEFAULT_NAMESPACE, KUBEVIRT_V1_VIRTUALMACHINE } from '@kubevirt-utils/constants/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn().mockResolvedValue({}),
}));

test('getResourceUrl', () => {
  const resource = {
    metadata: {
      name: 'vm',
      namespace: 'kube',
    },
  };

  const url = getResourceUrl({ model: VirtualMachineModel, resource });
  expect(url).toBe(`/k8s/ns/kube/${KUBEVIRT_V1_VIRTUALMACHINE}/vm`);

  const generalResourceURL = getResourceUrl({ model: VirtualMachineModel });
  expect(generalResourceURL).toBe(`/k8s/all-namespaces/${KUBEVIRT_V1_VIRTUALMACHINE}/`);

  const nullUrl = getResourceUrl({ model: null, resource });
  expect(nullUrl).toBe(null);

  const urlWithNamespace = getResourceUrl({
    activeNamespace: DEFAULT_NAMESPACE,
    model: VirtualMachineModel,
  });
  expect(urlWithNamespace).toBe(`/k8s/ns/${DEFAULT_NAMESPACE}/${KUBEVIRT_V1_VIRTUALMACHINE}/`);
});
