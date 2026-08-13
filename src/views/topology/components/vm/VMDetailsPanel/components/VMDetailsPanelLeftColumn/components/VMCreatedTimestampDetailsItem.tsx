import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
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
  const currentTime = useCurrentTime(60_000);
  const timestamp = timestampFor(new Date(vmTimestamp), new Date(currentTime), true);
  const timestampPluralized = pluralize(timestamp['value'], timestamp['time']);

  return (
    <DescriptionItem
      className="topology-vm-details-panel__item"
      data-test="virtual-machine-overview-details-created"
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
      descriptionHeader={t('Created')}
    />
  );
};

export default VMCreatedTimestampDetailsItem;
