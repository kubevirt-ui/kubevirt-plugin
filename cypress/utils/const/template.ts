import { DEFAULT_TEMPLATE_NAME, YAML_DS_NAME } from './index';

export const TEMPLATE = {
  CENTOS7: {
    dvName: 'centos7',
    metadataName: 'centos7-server-small',
    name: 'CentOS 7 VM',
  },
  CENTOSSTREAM8: {
    dvName: 'centos-stream8',
    metadataName: 'centos-stream8-server-small',
    name: 'CentOS Stream 8 VM',
  },
  CENTOSSTREAM9: {
    dvName: 'centos-stream9',
    metadataName: 'centos-stream9-server-small',
    name: 'CentOS Stream 9 VM',
  },
  FEDORA: {
    dvName: 'fedora',
    metadataName: 'fedora-server-small',
    name: 'Fedora VM',
  },
  RHEL7: {
    dvName: 'rhel7',
    metadataName: 'rhel7-server-small',
    name: 'Red Hat Enterprise Linux 7 VM',
  },
  RHEL8: {
    dvName: 'rhel8',
    metadataName: 'rhel8-server-small',
    name: 'Red Hat Enterprise Linux 8 VM',
  },
  RHEL9: {
    dvName: 'rhel9',
    metadataName: 'rhel9-server-small',
    name: 'Red Hat Enterprise Linux 9 VM',
  },
  WIN10: {
    dvName: 'win10',
    metadataName: 'windows10-desktop-medium',
    name: 'Microsoft Windows 10 VM',
  },
  WIN11: {
    dvName: 'win11',
    metadataName: 'windows11-desktop-medium',
    name: 'Microsoft Windows 11 VM',
  },
  WIN2K12R2: {
    dvName: 'win2k12r2',
    metadataName: 'windows2k12r2-server-medium',
    name: 'Microsoft Windows Server 2012 R2 VM',
  },
  WIN2K16: {
    dvName: 'win2k16',
    metadataName: 'windows2k16-server-medium',
    name: 'Microsoft Windows Server 2016 VM',
  },
  WIN2K19: {
    dvName: 'win2k19',
    metadataName: 'windows2k19-server-medium',
    name: 'Microsoft Windows Server 2019 VM',
  },
  WIN2K22: {
    dvName: 'win2k22',
    metadataName: 'windows2k22-server-medium',
    name: 'Microsoft Windows Server 2022 VM',
  },
  YAML: {
    dvName: YAML_DS_NAME,
    metadataName: DEFAULT_TEMPLATE_NAME,
    name: DEFAULT_TEMPLATE_NAME,
  },
};
