import React, { FC, useMemo, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import MigrationPolicyConfigurations from '../../../components/MigrationPolicyConfigurations/MigrationPolicyConfigurations';

import MigrationPolicyCreateFormHeader from './copmonents/MigrationPolicyCreateFormHeader/MigrationPolicyCreateFormHeader';
import MigrationPolicyFormDescription from './copmonents/MigrationPolicyFormDescription/MigrationPolicyFormDescription';
import MigrationPolicyFormFooter from './copmonents/MigrationPolicyFormFooter/MigrationPolicyFormFooter';
import SelectorLabelMatchGroup from './copmonents/SelectorLabelMatchGroup/SelectorLabelMatchGroup';
import { initialMigrationPolicyState, produceMigrationPolicy } from './utils/utils';

import './MigrationPolicyCreateForm.scss';

const MigrationPolicyCreateForm: FC = () => {
  const { t } = useKubevirtTranslation();

  const [state, setState] = useState(initialMigrationPolicyState);

  const setStateField = (field: string) => (value: any) => {
    const isvaluefunction = typeof value === 'function';
    setState((prevState) => ({
      ...prevState,
      [field]: isvaluefunction ? value(prevState?.[field]) : value,
    }));
  };
  const migrationPolicy = useMemo(() => produceMigrationPolicy(state), [state]);

  return (
    <div className="migration-policy__form">
      <MigrationPolicyCreateFormHeader />
      <Form className="migration-policy__form-body">
        <FormGroup fieldId="create-description">
          <MigrationPolicyFormDescription />
        </FormGroup>
        <FormGroup fieldId="migration-policy-name" isRequired label={t('MigrationPolicy name')}>
          <TextInput
            onChange={(_, value) => setStateField('migrationPolicyName')(value)}
            value={state?.migrationPolicyName}
          />
          <FormGroupHelperText>{t('Unique name of the MigrationPolicy')}</FormGroupHelperText>
        </FormGroup>
        <FormGroup fieldId="migration-policy-description" label={t('Description')}>
          <TextInput
            onChange={(_, value) => setStateField('description')(value)}
            value={state?.description}
          />
        </FormGroup>
        <h2>{t('Configurations')}</h2>
        <MigrationPolicyConfigurations
          setState={setState}
          setStateField={setStateField}
          state={state}
        />
        <h2>{t('Labels')}</h2>
        <FormGroup fieldId="migration-policy-project-selector" label={t('Project labels')}>
          <SelectorLabelMatchGroup
            labels={state?.namespaceSelectorMatchLabel}
            setLabels={setStateField('namespaceSelectorMatchLabel')}
          />
        </FormGroup>
        <FormGroup
          fieldId="migration-policy-vmi-selector"
          label={t('VirtualMachineInstance labels')}
        >
          <SelectorLabelMatchGroup
            isVMILabel
            labels={state?.vmiSelectorMatchLabel}
            setLabels={setStateField('vmiSelectorMatchLabel')}
          />
        </FormGroup>
        <MigrationPolicyFormFooter migrationPolicy={migrationPolicy} />
      </Form>
    </div>
  );
};

export default MigrationPolicyCreateForm;
