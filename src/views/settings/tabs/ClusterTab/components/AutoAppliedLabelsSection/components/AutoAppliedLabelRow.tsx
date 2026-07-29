import React, { FC } from 'react';

import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, Switch } from '@patternfly/react-core';

import AutoAppliedLabelKeyCell from './AutoAppliedLabelKeyCell';
import AutoAppliedLabelValueCell from './AutoAppliedLabelValueCell';

import '@settings/tabs/components/settings-label-cell.scss';

type AutoAppliedLabelRowProps = {
  existingKeys: string[];
  isDisabled: boolean;
  label: AutoAppliedLabel;
  onDelete: () => void;
  onUpdate: (label: AutoAppliedLabel) => void;
};

const AutoAppliedLabelRow: FC<AutoAppliedLabelRowProps> = ({
  existingKeys,
  isDisabled,
  label,
  onDelete,
  onUpdate,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <AutoAppliedLabelKeyCell
          existingKeys={existingKeys}
          isDisabled={isDisabled}
          label={label}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      </GridItem>
      <GridItem span={5}>
        <AutoAppliedLabelValueCell isDisabled={isDisabled} label={label} onUpdate={onUpdate} />
      </GridItem>
      <GridItem className="settings-label-cell__row" span={2}>
        <Switch
          aria-label={t('Required')}
          isChecked={label.required}
          isDisabled={isDisabled}
          onChange={(_event, checked) => onUpdate({ ...label, required: checked })}
        />
      </GridItem>
    </Grid>
  );
};

export default AutoAppliedLabelRow;
