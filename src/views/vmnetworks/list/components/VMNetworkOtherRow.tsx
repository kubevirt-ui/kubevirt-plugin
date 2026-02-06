import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import {
  getGroupVersionKindForResource,
  ResourceLink,
  RowProps,
  TableData,
} from '@openshift-console/dynamic-plugin-sdk';

import { OtherVMNetworkWithType } from '../types';
import { getVMNetworkTypeLabel } from '../utils';

type VMNetworkOtherRowType = RowProps<OtherVMNetworkWithType>;

const VMNetworkOtherRow: FC<VMNetworkOtherRowType> = ({ activeColumnIDs, obj }) => {
  const { t } = useKubevirtTranslation();

  const name = getName(obj);
  const namespace = getNamespace(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <ResourceLink
          groupVersionKind={getGroupVersionKindForResource(obj)}
          name={name}
          namespace={namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        {namespace ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
            name={namespace}
          />
        ) : (
          NO_DATA_DASH
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {getVMNetworkTypeLabel(obj.type, t)}
      </TableData>
    </>
  );
};

export default VMNetworkOtherRow;
