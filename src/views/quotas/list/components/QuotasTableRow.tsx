import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import QuotaActions from 'src/views/quotas/actions/QuotaActions';
import { QUOTA_UNITS } from 'src/views/quotas/utils/constants';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getCreationTimestamp, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  ResourceLink,
  RowProps,
  TableData,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';

import useIsDedicatedVirtualResources from '../../hooks/useIsDedicatedVirtualResources';
import { getQuotaDetailsURL } from '../../utils/url';
import {
  getAdditionalResourceKeys,
  getMainResourceKeys,
  getStatus,
  isNamespacedQuota,
} from '../../utils/utils';
import { QuotaColumn } from '../constants';

import AdditionalQuotaPopover from './AdditionalQuotaPopover/AdditionalQuotaPopover';
import QuotaLimitBar from './QuotaLimitBar/QuotaLimitBar';

const QuotasTableRow: FC<RowProps<ApplicationAwareQuota>> = ({ activeColumnIDs, obj: quota }) => {
  const isDedicatedVirtualResources = useIsDedicatedVirtualResources();

  const mainKeys = getMainResourceKeys(isDedicatedVirtualResources);
  const { cpu, memory, vmCount } = mainKeys;

  const quotaStatus = getStatus(quota);
  const { hard, used } = quotaStatus ?? {};

  const additionalResourceKeys = getAdditionalResourceKeys(quota);

  const quotaDetailsPath = getQuotaDetailsURL(quota);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.NAME}>
        <Link to={quotaDetailsPath}>{getName(quota)}</Link>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.NAMESPACE}>
        {isNamespacedQuota(quota) ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
            name={getNamespace(quota)}
          />
        ) : (
          <span>
            {quota?.status?.namespaces?.map((namespace) => namespace.namespace).join(', ')}
          </span>
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.CPU}>
        <QuotaLimitBar hard={hard} resourceKey={cpu} unit={QUOTA_UNITS.cpu} used={used} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.MEMORY}>
        <QuotaLimitBar hard={hard} resourceKey={memory} unit={QUOTA_UNITS.memory} used={used} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.VM_COUNT}>
        <QuotaLimitBar hard={hard} resourceKey={vmCount} unit={QUOTA_UNITS.vmCount} used={used} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.ADDITIONAL}>
        <AdditionalQuotaPopover
          additionalResourceKeys={additionalResourceKeys}
          quotaStatus={quotaStatus}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.CREATION_TIME}>
        <Timestamp timestamp={getCreationTimestamp(quota)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <QuotaActions isKebabToggle quota={quota} />
      </TableData>
    </>
  );
};

export default QuotasTableRow;
