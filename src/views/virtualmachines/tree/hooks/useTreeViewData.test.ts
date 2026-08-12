/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import useMultipleAccessReviews from '@kubevirt-utils/hooks/useMultipleAccessReviews';
import {
  AccessReviewResourceAttributes,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { createTreeViewData } from '../utils/utils';

import { useTreeViewData } from './useTreeViewData';

const projectNames = ['ns-allowed', 'ns-forbidden', 'ns-empty'];

// namespaces where `list virtualmachines` should be considered allowed
const allowedNamespaces = ['ns-allowed'];

jest.mock('@kubevirt-utils/hooks/useIsAdmin', () => ({
  useIsAdmin: jest.fn(() => false),
}));

jest.mock('@kubevirt-utils/hooks/useProjects', () => ({
  __esModule: true,
  default: jest.fn(() => [projectNames, true, null]),
}));

jest.mock('@kubevirt-utils/hooks/useFeatures/useFeatures', () => ({
  useFeatures: jest.fn(() => ({ featureEnabled: false })),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  ...jest.requireActual('@openshift-console/dynamic-plugin-sdk'),
  useK8sWatchResource: jest.fn(() => [[], true]),
  useK8sWatchResources: jest.fn((resourcesToWatch: Record<string, unknown>) =>
    Object.fromEntries(
      Object.keys(resourcesToWatch).map((namespace) => [namespace, { data: [], loaded: true }]),
    ),
  ),
}));

jest.mock('@kubevirt-utils/hooks/useMultipleAccessReviews', () => ({
  __esModule: true,
  default: jest.fn((attributes: AccessReviewResourceAttributes[]) => [
    attributes.map((resourceAttributes) => ({
      allowed: allowedNamespaces.includes(resourceAttributes.namespace),
      resourceAttributes,
    })),
    false,
  ]),
}));

jest.mock('../utils/utils', () => ({
  __esModule: true,
  createTreeViewData: jest.fn(() => []),
  isSystemNamespace: jest.fn(() => false),
}));

const getWatchedNamespaces = (): string[] =>
  Object.keys((useK8sWatchResources as jest.Mock).mock.calls.at(-1)?.[0] ?? {});

describe('useTreeViewData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMultipleAccessReviews as jest.Mock).mockImplementation(
      (attributes: AccessReviewResourceAttributes[]) => [
        attributes.map((resourceAttributes) => ({
          allowed: allowedNamespaces.includes(resourceAttributes.namespace),
          resourceAttributes,
        })),
        false,
      ],
    );
  });

  it('only watches namespaces where the user can list VMs', () => {
    renderHook(() => useTreeViewData());

    expect(getWatchedNamespaces()).toEqual(['ns-allowed']);
  });

  it('never opens a watch for a namespace the user is forbidden to list VMs in', () => {
    renderHook(() => useTreeViewData());

    expect(getWatchedNamespaces()).not.toEqual(expect.arrayContaining(['ns-forbidden']));
  });

  it('opens no per-namespace watches while access reviews are still loading', () => {
    (useMultipleAccessReviews as jest.Mock).mockImplementation(() => [[], true]);

    const { result } = renderHook(() => useTreeViewData());

    expect(getWatchedNamespaces()).toEqual([]);
    expect(result.current.loaded).toBe(false);
  });

  it('reports loaded once access reviews resolve, even if the user has no allowed namespaces', () => {
    (useMultipleAccessReviews as jest.Mock).mockImplementation(
      (attributes: AccessReviewResourceAttributes[]) => [
        attributes.map((resourceAttributes) => ({ allowed: false, resourceAttributes })),
        false,
      ],
    );

    const { result } = renderHook(() => useTreeViewData());

    expect(getWatchedNamespaces()).toEqual([]);
    expect(result.current.loaded).toBe(true);
  });

  it('does not perform per-namespace access reviews for admin users', () => {
    jest.requireMock('@kubevirt-utils/hooks/useIsAdmin').useIsAdmin.mockReturnValueOnce(true);

    renderHook(() => useTreeViewData());

    expect(useMultipleAccessReviews).toHaveBeenCalledWith([]);
  });

  it('only passes namespaces the user can list VMs in to createTreeViewData for tree structure', () => {
    renderHook(() => useTreeViewData());

    expect(createTreeViewData).toHaveBeenCalledWith(
      allowedNamespaces,
      expect.anything(),
      false,
      expect.anything(),
      false,
    );
  });

  it('never includes a forbidden namespace in the tree structure, even as an empty project', () => {
    renderHook(() => useTreeViewData());

    expect(createTreeViewData).toHaveBeenCalledWith(
      expect.not.arrayContaining(['ns-forbidden']),
      expect.anything(),
      false,
      expect.anything(),
      false,
    );
  });

  it('passes all project names to createTreeViewData for admin users', () => {
    jest.requireMock('@kubevirt-utils/hooks/useIsAdmin').useIsAdmin.mockReturnValueOnce(true);

    renderHook(() => useTreeViewData());

    expect(createTreeViewData).toHaveBeenCalledWith(
      projectNames,
      expect.anything(),
      true,
      expect.anything(),
      false,
    );
  });
});
