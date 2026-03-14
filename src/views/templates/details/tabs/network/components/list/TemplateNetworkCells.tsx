import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  getConfigInterfaceStateFromVM,
  isPodNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';

type TemplateNetworkCellProps = {
  row: NetworkPresentation;
};

export const TemplateNetworkCell: FC<TemplateNetworkCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();

  if (isPodNetwork(row.network)) {
    return <>{t('Pod networking')}</>;
  }

  return <TemplateValue value={row.network?.multus?.networkName ?? NO_DATA_DASH} />;
};

type TemplateStateCellProps = {
  row: NetworkPresentation;
  template: V1Template;
};

export const TemplateStateCell: FC<TemplateStateCellProps> = ({ row, template }) => {
  const templateVM = getTemplateVirtualMachineObject(template);
  return (
    <NetworkIcon configuredState={getConfigInterfaceStateFromVM(templateVM, row.network?.name)} />
  );
};
