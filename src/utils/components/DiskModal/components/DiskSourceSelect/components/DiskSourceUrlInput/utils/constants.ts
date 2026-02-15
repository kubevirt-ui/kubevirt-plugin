import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

type UrlSourceHelperText = {
  afterLabelText: string;
  beforeLabelText: string;
  label: string;
};

type UrlSourceHelperTextMapper = {
  [key in Exclude<OS_NAME_TYPES, OS_NAME_TYPES.other>]: UrlSourceHelperText;
};

export const HTTP_URL_PREFIX = 'http://';
export const HTTPS_URL_PREFIX = 'https://';

export const urlSourceHelperTextMapper: UrlSourceHelperTextMapper = {
  [OS_NAME_TYPES.centos]: {
    afterLabelText: 'and copy the download link URL for the cloud base image',
    beforeLabelText: 'Example: For CentOS, visit the ',
    label: 'CentOS cloud image list ',
  },
  [OS_NAME_TYPES.fedora]: {
    afterLabelText: 'and copy the download link URL for the cloud base image',
    beforeLabelText: 'Example: For Fedora, visit the ',
    label: 'Fedora cloud image list ',
  },
  [OS_NAME_TYPES.rhel]: {
    afterLabelText:
      '(requires login) and copy the download link URL of the KVM guest image (expires quickly)',
    beforeLabelText: 'Example: For RHEL, visit the ',
    label: 'RHEL download page ',
  },
  [OS_NAME_TYPES.windows]: {
    afterLabelText: 'and copy the download link URL',
    beforeLabelText: 'Example: For Windows, get a link to the ',
    label: 'installation iso of Microsoft Windows 10 ',
  },
};
