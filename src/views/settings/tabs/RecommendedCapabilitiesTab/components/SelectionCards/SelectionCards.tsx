import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid } from '@patternfly/react-core';

import { getSelectionCardConfigs } from '../../utils/constants';
import { CapabilitiesView } from '../../utils/types';
import SelectionCard from './SelectionCard';

type SelectionCardsProps = {
  onSelectView: (view: CapabilitiesView) => void;
  selectedView: CapabilitiesView;
};

const SelectionCards: FC<SelectionCardsProps> = ({ onSelectView, selectedView }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid hasGutter>
      {getSelectionCardConfigs(t).map((config) => (
        <SelectionCard
          config={config}
          isSelected={selectedView === config.id}
          key={config.id}
          onSelect={onSelectView}
        />
      ))}
    </Grid>
  );
};

export default SelectionCards;
