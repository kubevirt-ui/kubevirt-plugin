import { isValidUrl } from '@kubevirt-utils/utils/validation';

export const isValidTemplateIconUrl = (url: string): boolean =>
  isValidUrl(url, { allowRelative: true });
