import React, { FC } from 'react';

import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type TemplateDiskSourceCellProps = {
  row: DiskRowDataLayout;
};

const TemplateDiskSourceCell: FC<TemplateDiskSourceCellProps> = ({ row }) => {
  const isPVCSource = row?.namespace != null;

  if (isPVCSource) {
    return (
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
        name={row?.source}
        namespace={row?.namespace}
      />
    );
  }

  return <TemplateValue value={row?.source ?? NO_DATA_DASH} />;
};

export default TemplateDiskSourceCell;
