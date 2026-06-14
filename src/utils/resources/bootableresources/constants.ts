export const COMMON_INSTANCETYPES = 'common-instancetypes';
export const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
export const KUBEVIRT_ISO_LABEL = 'kubevirt.io/iso';
export const ISO = 'ISO';

export const deprecatedOSNames = ['centos-stream8', 'centos7'];

export const SHOW_DEPRECATED_BOOTABLE_VOLUMES = 'showDeprecatedBootableVolumes';
export const SHOW_DEPRECATED_BOOTABLE_VOLUMES_LABEL = 'Show deprecated bootable volumes';

export const FROM_QUERY_PARAM = 'from';
export const BOOTABLE_VOLUMES_CONTEXT_PARAM = 'bootablevolumes';

export const appendBootableVolumeContext = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${FROM_QUERY_PARAM}=${BOOTABLE_VOLUMES_CONTEXT_PARAM}`;
};
