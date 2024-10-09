import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, TextInput, Tooltip } from '@patternfly/react-core';
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
    <div className="row pairs-list__row">
      <div className="col-xs-5 pairs-list__value-pair-field">
        <EnvironmentSelectResource
          diskName={diskName}
          environmentName={environmentName}
          environmentNamesSelected={environmentNamesSelected}
          kind={kind}
          namespace={namespace}
          onChange={onChange}
          serial={serial}
        />
      </div>

      <div className="col-xs-5 pairs-list__name-field">
        <TextInput
          aria-labelledby="environment-serial-header"
          id={`${id}-serial`}
          onChange={(_, value) => onChange(diskName, environmentName, value, kind)}
          type="text"
          value={serial}
        />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Tooltip content={t('Remove')}>
          <Button
            className="pairs-list__span-btns"
            data-test-id="pairs-list__delete-from-btn"
            onClick={() => onRemove(diskName)}
            type="button"
            variant="plain"
          >
            <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon" />
            <span className="sr-only">{t('Delete')}</span>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
export default EnvironmentEditor;
