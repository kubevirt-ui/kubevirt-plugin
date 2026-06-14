import { TFunction } from 'i18next';

import { SearchTipsSection } from './types';

export const getSearchTipsSections = (t: TFunction): SearchTipsSection[] => [
  {
    tips: [
      { description: t('Running VMs'), query: 'status:running' },
      { description: t('Operating system'), query: 'os:rhel' },
    ],
    title: t('What kind of VM is it?'),
  },
  {
    note: t('vCPU and memory also support > >= < <='),
    tips: [
      { description: t('vCPU count'), query: 'vcpu>4' },
      { description: t('Memory'), query: 'memory>=8GiB' },
      { description: t('Hardware device'), query: 'has:gpu' },
    ],
    title: t('How much does it use?'),
  },
  {
    tips: [
      { description: t('Cluster'), query: 'cluster:local-cluster' },
      { description: t('Namespace'), query: 'project:default' },
      { description: t('Scheduled node'), query: 'node:worker-01' },
    ],
    title: t('Where does it live?'),
  },
  {
    tips: [
      { description: t('Running or paused VMs'), query: 'status:running,paused' },
      { description: t('Exclude VMs with a GPU'), query: '-has:gpu' },
      { description: t('Find by partial name'), query: 'web-server' },
      { description: t('Combined'), query: 'status:running vcpu>4 project:default' },
    ],
    title: t('Narrow your search'),
  },
];
