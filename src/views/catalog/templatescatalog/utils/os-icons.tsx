/* eslint-disable @typescript-eslint/no-var-requires */
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const bsd = require('./svg/bsd.svg') as string;
const centos = require('./svg/centos.svg') as string;
const debian = require('./svg/debian.svg') as string;
const fedora = require('./svg/fedora.svg') as string;
const opensuse = require('./svg/opensuse.svg') as string;
const rhel = require('./svg/rhel.svg') as string;
const ubuntu = require('./svg/ubuntu.svg') as string;
const windows = require('./svg/windows.svg') as string;
const linux = require('./svg/linux.svg') as string;

const iconMap = {
  'icon-bsd': bsd,
  'icon-centos': centos,
  'icon-debian': debian,
  'icon-fedora': fedora,
  'icon-linux': linux,
  'icon-opensuse': opensuse,
  'icon-other': linux,
  'icon-rhel': rhel,
  'icon-ubuntu': ubuntu,
  'icon-windows': windows,
};

export const getTemplateOSIcon = (template: K8sResourceCommon): string => {
  const icon = template?.metadata?.annotations?.iconClass;
  return iconMap[icon] || iconMap['icon-other'];
};
