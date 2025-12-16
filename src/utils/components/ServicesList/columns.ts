import { TFunction } from 'react-i18next';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

export const tableColumnClasses = [
  'pf-v6-u-w-25-on-xl',
  'pf-m-hidden pf-m-visible-on-md',
  'pf-m-hidden pf-m-visible-on-lg',
  'pf-m-hidden pf-m-visible-on-xl',
  'pf-m-hidden pf-m-visible-on-xl',
  'pf-v6-c-table__action',
];

export const getColumns = (t: TFunction): TableColumn<IoK8sApiCoreV1Service>[] => [
  {
    id: 'name',
    props: { className: tableColumnClasses[0] },
    sort: 'metadata.name',
    title: t('Name'),
    transforms: [sortable],
  },
  {
    id: 'namespace',
    props: { className: tableColumnClasses[1] },
    sort: 'metadata.namespace',
    title: t('Namespace'),
    transforms: [sortable],
  },
  {
    id: 'labels',
    props: { className: tableColumnClasses[2] },
    sort: 'metadata.labels',
    title: t('Labels'),
    transforms: [sortable],
  },
  {
    id: 'selector',
    props: { className: tableColumnClasses[3] },
    sort: 'spec.selector',
    title: t('Pod selector'),
    transforms: [sortable],
  },
  {
    id: 'location',
    props: { className: tableColumnClasses[4] },
    sort: 'spec.clusterIP',
    title: t('Location'),
    transforms: [sortable],
  },
  {
    id: 'actions',
    props: { className: tableColumnClasses[5] },
    title: '',
  },
];
