import React, { type ComponentType, type Dispatch, type FC, type SetStateAction } from 'react';

import { Button, ButtonVariant, Form, FormGroup, Split, SplitItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { type InitialMigrationPolicyState } from '../../list/components/MigrationPolicyCreateForm/utils/utils';
import { migrationPolicySpecKeys } from '../../utils/constants';
import {
  type EditMigrationPolicyInitialState,
  type MigrationPolicyStateDispatch,
} from '../MigrationPolicyEditModal/utils/constants';
import MigrationPolicyConfigurationDropdown from './compnents/MigrationPolicyConfigurationDropdown/MigrationPolicyConfigurationDropdown';
import { type MigrationPolicyConfigurationComponentProps } from './utils/constants';
import { getMigrationPolicyConfigurationOptions } from './utils/utils';

type MigrationPolicyConfigurationsProps = {
  setState: Dispatch<SetStateAction<EditMigrationPolicyInitialState | InitialMigrationPolicyState>>;
  setStateField: (field: string) => Dispatch<SetStateAction<MigrationPolicyStateDispatch>>;
  state: EditMigrationPolicyInitialState | InitialMigrationPolicyState;
};

const MigrationPolicyConfigurations: FC<MigrationPolicyConfigurationsProps> = ({
  setState,
  setStateField,
  state,
}) => {
  const options = getMigrationPolicyConfigurationOptions();
  const configKeys = Object.values(migrationPolicySpecKeys);
  const hasConfigSelected = configKeys.some((key) => Object.keys(state).includes(key));
  const hasAllConfigSelected = configKeys.every((key) => Object.keys(state).includes(key));
  return (
    <>
      <MigrationPolicyConfigurationDropdown
        isDisabled={hasAllConfigSelected}
        options={options}
        setState={setState}
        state={state}
      />
      {hasConfigSelected && (
        <Form isHorizontal>
          {Object.entries(options).map(([key, { component, label }]) => {
            if (!(key in state)) {
              return null;
            }

            const ConfigurationComponent =
              component as ComponentType<MigrationPolicyConfigurationComponentProps>;

            return (
              <FormGroup
                data-test={`${key}-selected`}
                fieldId={key}
                hasNoPaddingTop
                key={key}
                label={label}
              >
                <Split>
                  <SplitItem>
                    <ConfigurationComponent
                      setState={setStateField(key)}
                      state={state[key] as MigrationPolicyStateDispatch}
                    />
                  </SplitItem>
                  <SplitItem>
                    <Button
                      icon={<MinusCircleIcon />}
                      isInline
                      onClick={() =>
                        setState((prev) => {
                          const newState = { ...prev };
                          delete newState[key];
                          return newState;
                        })
                      }
                      variant={ButtonVariant.plain}
                    />
                  </SplitItem>
                </Split>
              </FormGroup>
            );
          })}
        </Form>
      )}
    </>
  );
};

export default MigrationPolicyConfigurations;
