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
    getWatchedResourcesActions().pushNewWatchedResource(
      WATCHED_RESOURCE_ENTRY,
      WatchedResourceKeyPrefix.CloneVm,
    );

    const data = getWatchedResourcesData();
    const entries = Object.entries(data);

    expect(entries).toHaveLength(1);
    expect(entries[0][0]).toMatch(/^clone-vm-/);
    expect(entries[0][1]).toEqual(WATCHED_RESOURCE_ENTRY);
  });

  it('should remove an entry when removeWatchedResource is called', () => {
    getWatchedResourcesActions().pushNewWatchedResource(
      WATCHED_RESOURCE_ENTRY,
      WatchedResourceKeyPrefix.CloneVm,
    );
    const [id] = Object.keys(getWatchedResourcesData());

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
