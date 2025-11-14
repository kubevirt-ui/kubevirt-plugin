import * as React from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { QUOTA_UNITS } from 'src/views/quotas/utils/constants';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { ApplicationAwareQuota } from '../../../form/types';
import useIsDedicatedVirtualResources from '../../../hooks/useIsDedicatedVirtualResources';
import { getHardFieldKeys, getQuotaDetailsPath, getStatus } from '../../../utils/utils';
import { QuotaColumn } from '../../constants';

import QuotaLimitBar from './QuotaLimitBar';

const QuotasTableRow: React.FC<RowProps<ApplicationAwareQuota>> = ({ activeColumnIDs, obj }) => {
  const isDedicatedVirtualResources = useIsDedicatedVirtualResources();

  const { cpu, memory, vmCount } = getHardFieldKeys(isDedicatedVirtualResources);

  const name = useMemo(() => getName(obj), [obj]);
  const namespace = useMemo(() => getNamespace(obj), [obj]);

  const { hard, used } = getStatus(obj);

  const quotaDetailsPath = getQuotaDetailsPath(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id={QuotaColumn.NAME}>
        <Link to={quotaDetailsPath}>{name}</Link>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.NAMESPACE}>
        <ResourceLink groupVersionKind={modelToGroupVersionKind(NamespaceModel)} name={namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.CPU}>
        <QuotaLimitBar fieldKey={cpu} hard={hard} unit={QUOTA_UNITS.cpu} used={used} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.MEMORY}>
        <QuotaLimitBar fieldKey={memory} hard={hard} unit={QUOTA_UNITS.memory} used={used} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={QuotaColumn.VM_COUNT}>
        <QuotaLimitBar fieldKey={vmCount} hard={hard} unit={QUOTA_UNITS.vmCount} used={used} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        {/* <QuotasActions isKebabToggle quota={obj} /> */}
      </TableData>
    </>
  );
};

export default QuotasTableRow;
