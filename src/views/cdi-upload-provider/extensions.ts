import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  ContextProvider,
  PVCAlert,
  PVCCreateProp,
  PVCDelete,
  PVCStatus,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  contextProvider: 'src/views/cdi-upload-provider/utils/context.tsx',
  pvcAlert: 'src/views/cdi-upload-provider/PVCAlertExtension.tsx',
  pvcCloneStatus: 'src/views/cdi-upload-provider/upload-pvc-form/statuses/ClonePVCStatus.tsx',
  pvcDelete: 'src/views/cdi-upload-provider/PVCDeleteAlertExtension.tsx',
  pvcSelectors: 'src/views/cdi-upload-provider/utils/selectors.ts',
  pvcUploadStatus: 'src/views/cdi-upload-provider/popover/UploadPVCPopover.tsx',
  pvcUploadUtils: 'src/views/cdi-upload-provider/utils/utils.tsx',
  UploadPVC: 'src/views/cdi-upload-provider/upload-pvc-form/UploadPVC.tsx',
  useCDIUpload: 'src/views/cdi-upload-provider/hooks/useCDIUpload.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      component: {
        $codeRef: 'UploadPVC',
      },
      exact: true,
      path: ['/k8s/ns/:ns/persistentvolumeclaims/~new/data'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      provider: { $codeRef: 'contextProvider.CDIUploadProvider' },
      useValueHook: { $codeRef: 'useCDIUpload' },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,

  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      label: '%plugin__kubevirt-plugin~With Data upload form%',
      path: '~new/data',
    },
    type: 'console.pvc/create-prop',
  } as EncodedExtension<PVCCreateProp>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      alert: { $codeRef: 'pvcAlert' },
    },
    type: 'console.pvc/alert',
  } as EncodedExtension<PVCAlert>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      predicate: { $codeRef: 'pvcSelectors.isPvcUploading' },
      priority: 10,
      status: { $codeRef: 'pvcUploadStatus' },
    },
    type: 'console.pvc/status',
  } as EncodedExtension<PVCStatus>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      predicate: { $codeRef: 'pvcSelectors.isPvcCloning' },
      priority: 9,
      status: { $codeRef: 'pvcCloneStatus' },
    },
    type: 'console.pvc/status',
  } as EncodedExtension<PVCStatus>,
  {
    properties: {
      alert: { $codeRef: 'pvcDelete' },
      onPVCKill: { $codeRef: 'pvcUploadUtils.killCDIBoundPVC' },
      predicate: { $codeRef: 'pvcSelectors.isPvcBoundToCDI' },
    },
    type: 'console.pvc/delete',
  } as EncodedExtension<PVCDelete>,
];
