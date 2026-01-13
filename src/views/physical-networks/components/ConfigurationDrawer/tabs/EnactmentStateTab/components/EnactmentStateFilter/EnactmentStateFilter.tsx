import React, { Dispatch, FC, SetStateAction } from 'react';

import MultiSelect from '@kubevirt-utils/components/MultiSelect/MultiSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { EnactmentState } from '../../../../../../utils/types';

import { enactmentStateDropdownItems } from './utils/constants';

import './EnactmentStateFilter.scss';

type EnactmentStateFilterProps = {
  selectedFilterType: EnactmentState[];
  setSelectedFilterType: Dispatch<SetStateAction<EnactmentState[]>>;
};

const EnactmentStateFilter: FC<EnactmentStateFilterProps> = ({
  selectedFilterType,
  setSelectedFilterType,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <MultiSelect
      items={enactmentStateDropdownItems}
      selectedItems={selectedFilterType}
      setSelectedItems={setSelectedFilterType}
      toggleText={t('State')}
    />
  );
};

export default EnactmentStateFilter;
