import React, { FC } from 'react';

import RequiredBadge from '@kubevirt-utils/components/badges/RequiredBadge/RequiredBadge';
import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { Grid, GridItem, Split, SplitItem } from '@patternfly/react-core';

import DefaultVMLabelValueCell from './DefaultVMLabelValueCell';

import '@settings/tabs/components/settings-label-cell.scss';

type DefaultVMLabelRowProps = {
  label: AutoAppliedLabel;
  onValueChange: (key: string, value: string) => void;
  userValue: string | undefined;
};

const DefaultVMLabelRow: FC<DefaultVMLabelRowProps> = ({ label, onValueChange, userValue }) => {
  const hasAdminValue = Boolean(label.value);

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <Split className="settings-label-cell__row" hasGutter>
          <SplitItem>{label.key}</SplitItem>
          {label.required && (
            <SplitItem>
              <RequiredBadge />
            </SplitItem>
          )}
        </Split>
      </GridItem>
      <GridItem span={7}>
        {hasAdminValue ? (
          <span className="settings-label-cell__row">{label.value}</span>
        ) : (
          <DefaultVMLabelValueCell
            labelKey={label.key}
            onSave={(value) => onValueChange(label.key, value)}
            value={userValue ?? ''}
          />
        )}
      </GridItem>
    </Grid>
  );
};

export default DefaultVMLabelRow;
