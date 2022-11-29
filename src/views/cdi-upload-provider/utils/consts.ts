export enum UPLOAD_STATUS {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED',
}
export const CDI_UPLOAD_URL_BUILDER = (uploadProxyURL) =>
  `https://${uploadProxyURL}/v1beta1/upload-form-async`;
export const CDI_UPLOAD_POD_ANNOTATION = 'cdi.kubevirt.io/storage.pod.phase';
export const CDI_UPLOAD_POD_NAME_ANNOTATION = 'cdi.kubevirt.io/storage.uploadPodName';
export const CDI_PHASE_PVC_ANNOTATION = 'cdi.kubevirt.io/storage.pod.phase';
export const CDI_BOUND_PVC_ANNOTATION = 'cdi.kubevirt.io/storage.condition.bound';
export const CDI_BIND_REQUESTED_ANNOTATION = 'cdi.kubevirt.io/storage.bind.immediate.requested';
export const CDI_CLONE_TOKEN_ANNOTAION = 'cdi.kubevirt.io/storage.clone.token';
export const CDI_PVC_PHASE_RUNNING = 'Running';
export const CDI_UPLOAD_OS_URL_PARAM = 'os';
export const CDI_KUBEVIRT_IO = 'cdi.kubevirt.io';
export const STORAGE_IMPORT_POD_NAME = 'storage.import.importPodName';
export const STORAGE_IMPORT_POD_LABEL = `${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_POD_NAME}`;
export const STORAGE_CLASS_CONFIG_MAP_NAME = 'kubevirt-storage-class-defaults';
// Different releases, different locations. Respect the order when resolving. Otherwise the configMap name/namespace is considered as well-known.
export const STORAGE_CLASS_CONFIG_MAP_NAMESPACES = [
  'kubevirt-hyperconverged',
  'openshift-cnv',
  'openshift',
  'kubevirt-native',
];
export const LABEL_CDROM_SOURCE = 'kubevirt.ui/cdrom';
export const TEMPLATE_OS_LABEL = 'os.template.kubevirt.io';
export const TEMPLATE_OS_NAME_ANNOTATION = 'name.os.template.kubevirt.io';
export const VM_TEMPLATE_NAME_PARAMETER = '${NAME}'; // eslint-disable-line no-template-curly-in-string
export const CDI_UPLOAD_SUPPORTED_TYPES_URL =
  'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/virtualization/virtual-machines#virt-cdi-supported-operations-matrix_virt-importing-virtual-machine-images-datavolumes';

export enum uploadErrorType {
  MISSING = 'missing',
  ALLOCATE = 'allocate',
  CERT = 'cert',
  CDI_INIT = 'cdi_init',
  PVC_SIZE = 'pvc_size',
}

export const dropdownUnits = {
  Mi: 'MiB',
  Gi: 'GiB',
  Ti: 'TiB',
};
