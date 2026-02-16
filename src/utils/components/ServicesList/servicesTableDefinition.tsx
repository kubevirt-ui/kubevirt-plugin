import React from 'react';
import { TFunction } from 'react-i18next';
import classNames from 'classnames';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { modelToGroupVersionKind, NamespaceModel, ServiceModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import { LabelList } from '../Labels/LabelList';

import { Selector } from './Selector/Selector';
import ServiceActions from './ServiceActions';
import ServiceLocation from './ServiceLocation';

const tableColumnClasses = [
  'pf-v6-u-w-25-on-xl',
  'pf-m-hidden pf-m-visible-on-md',
  'pf-m-hidden pf-m-visible-on-lg',
  'pf-m-hidden pf-m-visible-on-xl',
  'pf-m-hidden pf-m-visible-on-xl',
  'pf-v6-c-table__action',
];

const renderServiceName = (service: IoK8sApiCoreV1Service): React.ReactNode => {
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

const renderNamespace = (service: IoK8sApiCoreV1Service): React.ReactNode => {
  const cluster = getCluster(service);
  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
      name={getNamespace(service)}
    />
  );
};

const renderLabels = (service: IoK8sApiCoreV1Service): React.ReactNode => {
  const cluster = getCluster(service);
  return (
    <LabelList
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(ServiceModel)}
      labels={service?.metadata?.labels}
    />
  );
};

const renderSelector = (service: IoK8sApiCoreV1Service): React.ReactNode => (
  <Selector namespace={service?.metadata?.namespace} selector={service?.spec?.selector} />
);

const renderLocation = (service: IoK8sApiCoreV1Service): React.ReactNode => (
  <ServiceLocation service={service} />
);

const renderActions = (service: IoK8sApiCoreV1Service): React.ReactNode => (
  <ServiceActions service={service} />
);

export const getServicesColumns = (
  t: TFunction,
): ColumnConfig<IoK8sApiCoreV1Service, undefined>[] => [
  {
    getValue: (r) => r.metadata?.name || '',
    key: 'name',
    label: t('Name'),
    props: { className: tableColumnClasses[0] },
    renderCell: renderServiceName,
    sortable: true,
  },
  {
    getValue: (r) => r.metadata?.namespace || '',
    key: 'namespace',
    label: t('Namespace'),
    props: { className: classNames(tableColumnClasses[1], 'co-break-word') },
    renderCell: renderNamespace,
    sortable: true,
  },
  {
    getValue: (r) => JSON.stringify(r.metadata?.labels || {}),
    key: 'labels',
    label: t('Labels'),
    props: { className: tableColumnClasses[2] },
    renderCell: renderLabels,
    sortable: true,
  },
  {
    getValue: (r) => JSON.stringify(r.spec?.selector || {}),
    key: 'selector',
    label: t('Pod selector'),
    props: { className: tableColumnClasses[3] },
    renderCell: renderSelector,
    sortable: true,
  },
  {
    getValue: (r) => r.spec?.clusterIP || '',
    key: 'location',
    label: t('Location'),
    props: { className: tableColumnClasses[4] },
    renderCell: renderLocation,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: tableColumnClasses[5] },
    renderCell: renderActions,
  },
];

export const getServiceRowId = (service: IoK8sApiCoreV1Service): string =>
  service.metadata?.uid || '';
