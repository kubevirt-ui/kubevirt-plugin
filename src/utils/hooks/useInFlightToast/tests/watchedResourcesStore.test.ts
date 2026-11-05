import { modelToGroupVersionKind, VirtualMachineCloneModel } from '@kubevirt-utils/models';

import { resetInFlightToastStore } from '../inFlightToastStore';

import {
  type WatchedResourceEntry,
  WatchedResourceKeyPrefix,
} from '../features/watchedResources/types/types';
import {
  getWatchedResourcesActions,
  getWatchedResourcesData,
} from '../shared/selectors/inFlightToastStoreSelectors';

const WATCHED_RESOURCE_ENTRY: WatchedResourceEntry = {
  toastOptions: {
    title: 'Clone VM - test-vm-clone',
  },
  watchDataResource: {
    groupVersionKind: modelToGroupVersionKind(VirtualMachineCloneModel),
    name: 'test-vm-clone-cr',
    namespace: 'default',
  },
};

describe('watchedResources store slice', () => {
  beforeEach(() => {
    resetInFlightToastStore();
  });

  afterEach(() => {
    resetInFlightToastStore();
  });

  it('should add an entry when pushNewWatchedResource is called', () => {
    const id = getWatchedResourcesActions().pushNewWatchedResource(
      WATCHED_RESOURCE_ENTRY,
      WatchedResourceKeyPrefix.CloneVm,
    );

    const data = getWatchedResourcesData();

    expect(id).toMatch(/^clone-vm-/);
    expect(Object.keys(data)).toHaveLength(1);
    expect(data[id]).toEqual(WATCHED_RESOURCE_ENTRY);
  });

  it('should update toast options when updateWatchedResourceToastOptions is called', () => {
    const id = getWatchedResourcesActions().pushNewWatchedResource(
      WATCHED_RESOURCE_ENTRY,
      WatchedResourceKeyPrefix.CloneVm,
    );
    const error = new Error('clone failed');

    getWatchedResourcesActions().updateWatchedResourceToastOptions(id, { error });

    expect(getWatchedResourcesData()[id].toastOptions.error).toBe(error);
  });

  it('should remove an entry when removeWatchedResource is called', () => {
    const id = getWatchedResourcesActions().pushNewWatchedResource(
      WATCHED_RESOURCE_ENTRY,
      WatchedResourceKeyPrefix.CloneVm,
    );

    getWatchedResourcesActions().removeWatchedResource(id);

    expect(getWatchedResourcesData()).toEqual({});
  });

  it('should clear watchedResources data when resetInFlightToastStore is called', () => {
    getWatchedResourcesActions().pushNewWatchedResource(
      WATCHED_RESOURCE_ENTRY,
      WatchedResourceKeyPrefix.CloneVm,
    );

    resetInFlightToastStore();

    expect(getWatchedResourcesData()).toEqual({});
  });
});
