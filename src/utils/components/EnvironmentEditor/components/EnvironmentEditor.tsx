import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Grid, GridItem, TextInput, Tooltip } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { EnvironmentKind } from '../constants';

import EnvironmentSelectResource from './EnvironmentSelectResource';

import './EnvironmentEditor.scss';

type EnvironmentEditorProps = {
  diskName: string;
  environmentName?: string;
  environmentNamesSelected: string[];
  id: number;
  kind?: EnvironmentKind;
  namespace: string;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  onRemove?: (diskName: string) => void;
  serial?: string;
};

const EnvironmentEditor: FC<EnvironmentEditorProps> = ({
  diskName,
  environmentName,
  environmentNamesSelected,
  id,
  kind,
  namespace,
  onChange,
  onRemove,
  serial,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid className="pairs-list__row" hasGutter>
      <GridItem className="pairs-list__value-pair-field" sm={5}>
        <EnvironmentSelectResource
          diskName={diskName}
          environmentName={environmentName}
          environmentNamesSelected={environmentNamesSelected}
          kind={kind}
          namespace={namespace}
          onChange={onChange}
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
