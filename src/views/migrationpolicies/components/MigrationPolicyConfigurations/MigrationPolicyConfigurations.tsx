import React from 'react';

import { Button, ButtonVariant, Form, FormGroup, Split, SplitItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { InitialMigrationPolicyState } from '../../list/components/MigrationPolicyCreateForm/utils/utils';
import { migrationPolicySpecKeys } from '../../utils/constants';
import {
  EditMigrationPolicyInitialState,
  MigrationPolicyStateDispatch,
} from '../MigrationPolicyEditModal/utils/constants';

import MigrationPolicyConfigurationDropdown from './compnents/MigrationPolicyConfigurationDropdown/MigrationPolicyConfigurationDropdown';
import { getMigrationPolicyConfigurationOptions } from './utils/utils';

type MigrationPolicyConfigurationsProps = {
  state: InitialMigrationPolicyState | EditMigrationPolicyInitialState;
  setState: React.Dispatch<
    React.SetStateAction<InitialMigrationPolicyState | EditMigrationPolicyInitialState>
  >;
  setStateField: (
    field: string,
  ) => React.Dispatch<React.SetStateAction<MigrationPolicyStateDispatch>>;
};

const MigrationPolicyConfigurations: React.FC<MigrationPolicyConfigurationsProps> = ({
  state,
  setState,
  setStateField,
}) => {
  const options = getMigrationPolicyConfigurationOptions();
  const configKeys = Object.values(migrationPolicySpecKeys);
  const hasConfigSelected = configKeys.some((key) => Object.keys(state).includes(key));
  const hasAllConfigSelected = configKeys.every((key) => Object.keys(state).includes(key));
  return (
    <>
      <MigrationPolicyConfigurationDropdown
        state={state}
        setState={setState}
        options={options}
        isDisabled={hasAllConfigSelected}
      />
      {hasConfigSelected && (
        <Form isHorizontal>
          {Object.entries(options).map(
            ([key, { label, component: Component }]) =>
              key in state && (
                <FormGroup
                  hasNoPaddingTop
                  data-test-id={`${key}-selected`}
                  key={key}
                  fieldId={key}
                  label={label}
                >
                  <Split>
                    <SplitItem>
                      <Component state={state?.[key]} setState={setStateField(key)} />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        onClick={() =>
                          setState((prev) => {
                            const newState = { ...prev };
                            delete newState[key];
                            return newState;
                          })
                        }
                        variant={ButtonVariant.plain}
                        isInline
                      >
                        <MinusCircleIcon />
                      </Button>
                    </SplitItem>
                  </Split>
                </FormGroup>
              ),
          )}
        </Form>
      )}
    </>
  );
};

export default MigrationPolicyConfigurations;
