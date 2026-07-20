import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

import { getStorageMigrationsListUrl } from './urls';

jest.mock('@kubevirt-utils/resources/shared', () => ({
  getResourceUrl: jest.fn(),
}));

const getResourceUrlMock = getResourceUrl as jest.MockedFunction<typeof getResourceUrl>;

describe('getStorageMigrationsListUrl', () => {
  beforeEach(() => {
    getResourceUrlMock.mockReset();
    getResourceUrlMock.mockImplementation(({ activeNamespace, model }) => {
      const ns =
        activeNamespace && activeNamespace !== ALL_NAMESPACES_SESSION_KEY
          ? `ns/${activeNamespace}`
          : 'all-namespaces';
      return `/k8s/${ns}/${model.apiGroup}~${model.apiVersion}~${model.kind}`;
    });
  });

  it('uses the MultiNamespaceVirtualMachineStorageMigrationPlan GVK path for a namespace', () => {
    expect(getStorageMigrationsListUrl('my-ns')).toBe(
      '/k8s/ns/my-ns/migrations.kubevirt.io~v1alpha1~MultiNamespaceVirtualMachineStorageMigrationPlan',
    );
    expect(getResourceUrlMock).toHaveBeenCalledWith({
      activeNamespace: 'my-ns',
      model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    });
  });

  it('uses all-namespaces when namespace is omitted', () => {
    expect(getStorageMigrationsListUrl()).toBe(
      '/k8s/all-namespaces/migrations.kubevirt.io~v1alpha1~MultiNamespaceVirtualMachineStorageMigrationPlan',
    );
    expect(getResourceUrlMock).toHaveBeenCalledWith({
      activeNamespace: ALL_NAMESPACES_SESSION_KEY,
      model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    });
  });
});
