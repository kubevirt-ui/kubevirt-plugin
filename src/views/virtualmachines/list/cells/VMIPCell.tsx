import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIIPAddressesWithName } from '@kubevirt-utils/resources/vmi';

import FirstItemListPopover from '../components/FirstItemListPopover/FirstItemListPopover';

import { VMCellWithCallbacksProps } from './types';

const VMIPCell: FC<VMCellWithCallbacksProps> = ({ callbacks, row }) => {
  const { t } = useKubevirtTranslation();
  const vmi = callbacks.getVmi(row);

  if (!vmi) {
    return <>{NO_DATA_DASH}</>;
  }

  const ipAddresses = getVMIIPAddressesWithName(vmi);

  return <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddresses} />;
};

export default VMIPCell;
