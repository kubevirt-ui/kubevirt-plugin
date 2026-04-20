import type { ResourceListPage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  PreferencePage: './views/preferences/list/PreferencePage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'PreferencePage',
      },
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterPreference',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
  {
    properties: {
      component: {
        $codeRef: 'PreferencePage',
      },
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachinePreference',
        version: 'v1beta1',
      },
      prefixNamespaced: true,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
];
