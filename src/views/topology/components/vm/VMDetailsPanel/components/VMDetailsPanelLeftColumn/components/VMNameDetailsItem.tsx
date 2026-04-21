import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';

import '../../../TopologyVMDetailsPanel.scss';

type VMNameDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMNameDetailsItem: FC<VMNameDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={getName(vm)}
      descriptionHeader={<span id="vm-name">{t('Name')}</span>}
    />
  );
};

export default VMNameDetailsItem;
