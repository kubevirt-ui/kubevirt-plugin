import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCreationTimestamp } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { pluralize } from '@patternfly/react-core';

import '../../../TopologyVMDetailsPanel.scss';

type VMCreatedTimestampDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMCreatedTimestampDetailsItem: FC<VMCreatedTimestampDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const vmTimestamp = getCreationTimestamp(vm);
  const timestamp = timestampFor(new Date(vmTimestamp), new Date(Date.now()), true);
  const timestampPluralized = pluralize(timestamp['value'], timestamp['time']);

  return (
    <DescriptionItem
      descriptionData={
        timestamp !== NO_DATA_DASH ? (
          <>
            <Timestamp simple timestamp={vmTimestamp} /> (
            {t('{{timestampPluralized}} ago', { timestampPluralized })})
          </>
        ) : (
          NO_DATA_DASH
        )
      }
      className="topology-vm-details-panel__item"
      data-test-id="virtual-machine-overview-details-created"
      descriptionHeader={t('Created')}
    />
  );
};

export default VMCreatedTimestampDetailsItem;
