import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn().mockResolvedValue({}),
}));

test('getResourceUrl', () => {
  const resource = {
    metadata: {
      namespace: 'kube',
      name: 'vm',
    },
  };

  const url = getResourceUrl({ model: VirtualMachineModel, resource });
  expect(url).toBe('/k8s/ns/kube/kubevirt.io~v1~VirtualMachine/vm');

  const generalResourceURL = getResourceUrl({ model: VirtualMachineModel });
  expect(generalResourceURL).toBe('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine/');

  const nullUrl = getResourceUrl({ model: null, resource });
  expect(nullUrl).toBe(null);

  const urlWithNamespace = getResourceUrl({
    model: VirtualMachineModel,
    activeNamespace: DEFAULT_NAMESPACE,
  });
  expect(urlWithNamespace).toBe(`/k8s/ns/${DEFAULT_NAMESPACE}/kubevirt.io~v1~VirtualMachine/`);
});
