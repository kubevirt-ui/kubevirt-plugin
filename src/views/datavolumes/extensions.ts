import type { ResourceDetailsPage, ResourceListPage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  DataVolumePage: './views/datavolumes/details/DataVolumePage.tsx',
  DataVolumesList: './views/datavolumes/list/DataVolumesList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'DataVolumePage' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataVolume',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      component: { $codeRef: 'DataVolumesList' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataVolume',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
];
