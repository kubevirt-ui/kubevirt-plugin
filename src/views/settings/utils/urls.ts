import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';

export const getSettingsURL = (namespace?: string): string =>
  `/k8s/${getNamespacePathSegment(namespace)}/${VIRTUALIZATION_PATHS.SETTINGS}`;
