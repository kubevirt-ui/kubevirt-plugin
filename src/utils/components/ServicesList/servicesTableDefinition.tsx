import { type ReactNode } from 'react';
import classNames from 'classnames';
import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { modelToGroupVersionKind, NamespaceModel, ServiceModel } from '@kubevirt-utils/models';
import { getLabels, getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import { LabelList } from '../Labels/LabelList';
import { Selector } from './Selector/Selector';
import ServiceActions from './ServiceActions';
import ServiceLocation from './ServiceLocation';

const TABLE_COLUMN_CLASSES = [
  'pf-v6-u-w-25-on-xl',
  'pf-m-hidden pf-m-visible-on-md',
  'pf-m-hidden pf-m-visible-on-lg',
  'pf-m-hidden pf-m-visible-on-xl',
  'pf-m-hidden pf-m-visible-on-xl',
  'pf-v6-c-table__action',
];

const renderServiceName = (service: IoK8sApiCoreV1Service): ReactNode => {
  const cluster = getCluster(service);
  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(ServiceModel)}
      name={getName(service)}
      namespace={getNamespace(service)}
    />
  );
};

const renderNamespace = (service: IoK8sApiCoreV1Service): ReactNode => {
  const cluster = getCluster(service);
  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
      name={getNamespace(service)}
    />
  );
};

const renderLabels = (service: IoK8sApiCoreV1Service): ReactNode => {
  const cluster = getCluster(service);
  return (
    <LabelList
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(ServiceModel)}
      labels={getLabels(service)}
    />
  );
};

const renderSelector = (service: IoK8sApiCoreV1Service): ReactNode => {
  const cluster = getCluster(service);
  return (
    <Selector
      cluster={cluster}
      namespace={getNamespace(service)}
      selector={service?.spec?.selector}
    />
  );
};

const renderLocation = (service: IoK8sApiCoreV1Service): ReactNode => (
  <ServiceLocation service={service} />
);

const renderActions = (service: IoK8sApiCoreV1Service): ReactNode => (
  <ServiceActions service={service} />
);

export const getServicesColumns = (
  t: TFunction,
): ColumnConfig<IoK8sApiCoreV1Service, undefined>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    props: { className: TABLE_COLUMN_CLASSES[0] },
    renderCell: renderServiceName,
    sortable: true,
  },
  {
    getValue: (row) => getNamespace(row) ?? '',
    key: 'namespace',
    label: t('Namespace'),
    props: { className: classNames(TABLE_COLUMN_CLASSES[1], 'co-break-word') },
    renderCell: renderNamespace,
    sortable: true,
  },
  {
    getValue: (row) => JSON.stringify(getLabels(row) ?? {}),
    key: 'labels',
    label: t('Labels'),
    props: { className: TABLE_COLUMN_CLASSES[2] },
    renderCell: renderLabels,
    sortable: true,
  },
  {
    getValue: (row) => JSON.stringify(row.spec?.selector ?? {}),
    key: 'selector',
    label: t('Pod selector'),
    props: { className: TABLE_COLUMN_CLASSES[3] },
    renderCell: renderSelector,
    sortable: true,
  },
  {
    getValue: (row) => row.spec?.clusterIP ?? '',
    key: 'location',
    label: t('Location'),
    props: { className: TABLE_COLUMN_CLASSES[4] },
    renderCell: renderLocation,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: TABLE_COLUMN_CLASSES[5] },
    renderCell: renderActions,
  },
];

export const getServiceRowId = (service: IoK8sApiCoreV1Service): string => getUID(service);
