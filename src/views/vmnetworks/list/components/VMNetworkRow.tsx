import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getLocalnet, getMTU, getVLANID } from '@kubevirt-utils/resources/udn/selectors';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import VMNetworkActions from '../../actions/VMNetworkActions';
import { VM_NETWORKS_PATH } from '../../constants';

import MatchedProjects from './MatchedProjects';

type VMNetworkRowType = RowProps<ClusterUserDefinedNetworkKind>;

const VMNetworkRow: FC<VMNetworkRowType> = ({ activeColumnIDs, obj }) => {
  const { t } = useKubevirtTranslation();
  const name = getName(obj);
  const mtu = getMTU(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link to={`${VM_NETWORKS_PATH}/${name}`}>{name}</Link>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="connected-projects">
        <MatchedProjects obj={obj} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="physicalNetworkName">
        {getLocalnet(obj)?.physicalNetworkName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="vlanID">
        {getVLANID(obj) || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="mtu">
        {mtu || <div className="pf-v6-u-text-color-subtle">{t('Not available')}</div>}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <VMNetworkActions obj={obj} />
      </TableData>
    </>
  );
};
export default VMNetworkRow;
