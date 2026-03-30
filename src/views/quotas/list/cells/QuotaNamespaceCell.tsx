import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { isNamespacedQuota } from '../../utils/utils';
import { getNamespaceColumnValue } from '../utils/helpers';

type QuotaNamespaceCellProps = {
  row: ApplicationAwareQuota;
};

const QuotaNamespaceCell: FC<QuotaNamespaceCellProps> = ({ row }) => {
  if (isNamespacedQuota(row)) {
    return (
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
        name={getNamespace(row)}
      />
    );
  }
  const namespacesValue = getNamespaceColumnValue(row);
  return <span>{namespacesValue || NO_DATA_DASH}</span>;
};

export default QuotaNamespaceCell;
