import React from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
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
  setState: React.Dispatch<
    React.SetStateAction<EditMigrationPolicyInitialState | InitialMigrationPolicyState>
  >;
  setStateField: (
    field: string,
  ) => React.Dispatch<React.SetStateAction<MigrationPolicyStateDispatch>>;
  state: EditMigrationPolicyInitialState | InitialMigrationPolicyState;
};

const MigrationPolicyConfigurations: React.FC<MigrationPolicyConfigurationsProps> = ({
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
        <Form className="migration-configuration-dropdown" isHorizontal>
          {Object.entries(options).map(
            ([key, { component: Component, label, labelHelp = null }]) =>
              key in state && (
                <FormGroup
                  data-test-id={`${key}-selected`}
                  fieldId={key}
                  hasNoPaddingTop
                  key={key}
                  label={label}
                >
                  labelHelp && (
                  <FormGroupHelperText>
                    <Title
                      className="pf-v6-c-popover__header-title pf-v6-u-mb-sm"
                      headingLevel="h6"
                    >
                      {label}
                    </Title>
                    {labelHelp.helpText}
                    <a href={labelHelp.helpInfo} rel="noopener noreferrer" target="_blank">
                      {labelHelp.helpInfo}
                    </a>
                  </FormGroupHelperText>
                  )
                  <Split>
                    <SplitItem>
                      <Component setState={setStateField(key)} state={state?.[key]} />
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
                        icon={<MinusCircleIcon />}
                        isInline
                        variant={ButtonVariant.plain}
                      />
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
