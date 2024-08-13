import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  Checkups: './views/checkups/Checkups.tsx',
  CheckupsNetworkDetailsPage: './views/checkups/network/details/CheckupsNetworkDetailsPage.tsx',
  CheckupsNetworkForm: './views/checkups/network/components/form/CheckupsNetworkForm.tsx',
  CheckupsStorageDetailsPage: './views/checkups/storage/details/CheckupsStorageDetailsPage.tsx',
  CheckupsStorageForm: './views/checkups/storage/components/form/CheckupsStorageForm.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualization-checkups',
        'data-test-id': 'virtualization-checkups-nav-item',
      },
      href: 'checkups',
      id: 'virtualization-checkups',
      insertAfter: 'migrationpolicies',
      name: '%plugin__kubevirt-plugin~Checkups%',
      prefixNamespaced: true,
      section: 'virtualization',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsNetworkForm',
      },
      path: ['/k8s/ns/:ns/checkups/network/form'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsNetworkDetailsPage',
      },
      path: ['/k8s/ns/:ns/checkups/network/:vmName'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsStorageForm',
      },
      path: ['/k8s/ns/:ns/checkups/storage/form'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      component: {
        $codeRef: 'CheckupsStorageDetailsPage',
      },
      path: ['/k8s/ns/:ns/checkups/storage/:vmName'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'Checkups',
      },
      path: ['/k8s/ns/:ns/checkups', '/k8s/all-namespaces/checkups'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
