import {
  getGalleryBootableVolumes,
  getGalleryTemplates,
  getGalleryWatchList,
  resetGalleryWatchRegistry,
  setGalleryWatchRegistry,
} from './gallery-watch-registry';
import {
  sceneBootableVolume,
  sceneClusterInstancetype,
  scenePopulatedVirtualMachines,
  sceneTemplate,
} from './virt-page-fixtures';

export type GallerySceneDataPreset = 'empty' | 'populated';

let activePreset: GallerySceneDataPreset = 'empty';

const applyRegistryForPreset = (preset: GallerySceneDataPreset): void => {
  if (preset === 'empty') {
    resetGalleryWatchRegistry();
    return;
  }

  setGalleryWatchRegistry({
    bootableVolumes: [sceneBootableVolume],
    templates: [sceneTemplate],
    watchLists: {
      VirtualMachine: scenePopulatedVirtualMachines,
      VirtualMachineClusterInstancetype: [sceneClusterInstancetype],
    },
  });
};

export const applyGallerySceneDataPreset = (preset: GallerySceneDataPreset): void => {
  activePreset = preset;
  applyRegistryForPreset(preset);
};

export const getGallerySceneDataPreset = (): GallerySceneDataPreset => activePreset;

export { getGalleryBootableVolumes, getGalleryTemplates, getGalleryWatchList };
