import React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, NamespaceModel, ServiceModel } from '@kubevirt-utils/models';
import { ResourceLink, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { css } from '@patternfly/react-styles';

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
  if (!obj) return null;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[0]} id="name">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(ServiceModel)}
          name={obj?.metadata.name}
          namespace={obj?.metadata.namespace}
        />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className={css(tableColumnClasses[1], 'co-break-word')}
        id="namespace"
      >
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={obj?.metadata.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className={tableColumnClasses[2]} id="labels">
        <LabelList
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
