import React, { FC } from 'react';

import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Grid, GridItem, TextInput, Tooltip } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { EnvironmentKind } from '../constants';

import EnvironmentSelectResource from './EnvironmentSelectResource';

import './EnvironmentEditor.scss';

type EnvironmentEditorProps = {
  diskName: string;
  environmentName?: string;
  id: number;
  kind?: EnvironmentKind;
  loaded: boolean;
  loadError: any;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  onRemove?: (diskName: string) => void;
  selectOptions: EnhancedSelectOptionProps[];
  serial?: string;
};

const EnvironmentEditor: FC<EnvironmentEditorProps> = ({
  diskName,
  environmentName,
  id,
  kind,
  loaded,
  loadError,
  onChange,
  onRemove,
  selectOptions,
  serial,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid className="pairs-list__row" hasGutter>
      <GridItem className="pairs-list__value-pair-field" sm={5}>
        <EnvironmentSelectResource
          diskName={diskName}
          environmentName={environmentName}
          kind={kind}
          loaded={loaded}
          loadError={loadError}
          onChange={onChange}
          selectOptions={selectOptions}
          serial={serial}
        />
      </GridItem>
      <GridItem className="pairs-list__name-field" sm={5}>
        <TextInput
          aria-labelledby="environment-serial-header"
          id={`${id}-serial`}
          onChange={(_, value) => onChange(diskName, environmentName, value, kind)}
          type="text"
          value={serial}
        />
      </GridItem>
      <GridItem className="pairs-list__action" sm={1}>
        <Tooltip content={t('Remove')}>
          <Button
            className="pairs-list__span-btns"
            data-test-id="pairs-list__delete-from-btn"
            onClick={() => onRemove(diskName)}
            variant={ButtonVariant.plain}
          >
            <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon" />
            <span className="sr-only">{t('Delete')}</span>
          </Button>
        </Tooltip>
      </GridItem>
    </Grid>
  );
};
export default EnvironmentEditor;
