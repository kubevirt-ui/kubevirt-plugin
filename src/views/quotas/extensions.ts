import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  QuotaCreateForm: './views/quotas/form/QuotaCreateForm.tsx',
  QuotaDetailsPage: './views/quotas/details/QuotaDetailsPage.tsx',
  QuotaEditForm: './views/quotas/form/QuotaEditForm.tsx',
  QuotasList: './views/quotas/list/QuotasList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-quotas',
        'data-test-id': 'quotas-nav-item',
      },
      href: 'quotas',
      id: 'quotas',
      name: '%plugin__kubevirt-plugin~Quotas%',
      prefixNamespaced: true,
      section: 'virtualization',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      component: { $codeRef: 'QuotasList' },
      path: ['/k8s/ns/:ns/quotas', '/k8s/all-namespaces/quotas', '/k8s/cluster/quotas'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      component: { $codeRef: 'QuotaCreateForm' },
      path: ['/k8s/ns/:ns/quotas/~new', '/k8s/ns/:ns/quotas/~new/yaml'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      component: { $codeRef: 'QuotaDetailsPage' },
      path: ['/k8s/ns/:ns/quotas/:name', '/k8s/cluster/quotas/:name'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      component: { $codeRef: 'QuotaEditForm' },
      path: ['/k8s/ns/:ns/quotas/:name/edit', '/k8s/ns/:ns/quotas/:name/edit/yaml'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
