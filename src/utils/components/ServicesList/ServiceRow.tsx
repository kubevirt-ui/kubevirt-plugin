import React from 'react';
import classNames from 'classnames';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, NamespaceModel, ServiceModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

import { LabelList } from '../Labels/LabelList';

import { Selector } from './Selector/Selector';
import { tableColumnClasses } from './columns';
import ServiceActions from './ServiceActions';
import ServiceLocation from './ServiceLocation';

type ServiceTableRowProps = {
  activeColumnIDs: Set<string>;
  obj: IoK8sApiCoreV1Service;
};

const ServiceTableRow = ({ activeColumnIDs, obj }: ServiceTableRowProps) => {
  const cluster = getCluster(obj);
  if (!obj) return null;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[0]} id="name">
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={modelToGroupVersionKind(ServiceModel)}
          name={getName(obj)}
          namespace={getNamespace(obj)}
        />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className={classNames(tableColumnClasses[1], 'co-break-word')}
        id="namespace"
      >
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={getNamespace(obj)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[2]} id="labels">
        <LabelList
          cluster={cluster}
          groupVersionKind={modelToGroupVersionKind(ServiceModel)}
          labels={obj?.metadata.labels}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[3]} id="selector">
        <Selector namespace={obj?.metadata.namespace} selector={obj?.spec.selector} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[4]} id="location">
        <ServiceLocation service={obj} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[5]} id="actions">
        <ServiceActions service={obj} />
      </TableData>
    </>
  );
};

export default ServiceTableRow;
