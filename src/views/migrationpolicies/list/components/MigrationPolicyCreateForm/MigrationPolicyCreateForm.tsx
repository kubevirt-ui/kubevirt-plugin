import React, { useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Form, FormGroup, StackItem, TextInput } from '@patternfly/react-core';

import BandwidthInput from './copmonents/BandwidthInput/BandwidthInput';
import CompletionTimeoutInput from './copmonents/CompletionTimeoutInput/CompletionTimeoutInput';
import MigrationPolicyCreateFormHeader from './copmonents/MigrationPolicyCreateFormHeader/MigrationPolicyCreateFormHeader';
import MigrationPolicyFormDescription from './copmonents/MigrationPolicyFormDescription/MigrationPolicyFormDescription';
import MigrationPolicyFormFooter from './copmonents/MigrationPolicyFormFooter/MigrationPolicyFormFooter';
import SelectorLabelMatchGroup from './copmonents/SelectorLabelMatchGroup/SelectorLabelMatchGroup';
import { initialMigrationPolicyState, produceUpdatedMigrationPolicy } from './utils/utils';

import './MigrationPolicyCreateForm.scss';

const MigrationPolicyCreateForm: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const [state, setState] = useState(initialMigrationPolicyState);

  const setStateField = (field: string) => (value: any) => {
    const isvaluefunction = typeof value === 'function';
    setState((prevState) => ({
      ...prevState,
      [field]: isvaluefunction ? value(prevState?.[field]) : value,
    }));
  };
  const migrationPolicy = useMemo(() => produceUpdatedMigrationPolicy(state), [state]);

  return (
    <div className="migration-policy__form">
      <MigrationPolicyCreateFormHeader />
      <Form className="migration-policy__form-body">
        <FormGroup fieldId="create-description">
          <MigrationPolicyFormDescription />
        </FormGroup>
        <FormGroup
          fieldId="migration-policy-name"
          label={t('MigrationPolicy name')}
          isRequired
          helperText={t('Unique name of the MigrationPolicy')}
        >
          <TextInput
            value={state?.migrationPolicyName}
            onChange={setStateField('migrationPolicyName')}
          />
        </FormGroup>
        <FormGroup fieldId="migration-policy-description" label={t('Description')}>
          <TextInput value={state?.description} onChange={setStateField('description')} />
        </FormGroup>
        <h2>{t('Configurations')}</h2>
        <FormGroup
          fieldId="migration-policy-bandwidth"
          label={t('Bandwidth consumption')}
          helperText={t('To gain unlimited bandwidth, set to 0')}
        >
          <BandwidthInput
            bandwidth={state?.bandwidthPerMigration}
            setBandwidth={setStateField('bandwidthPerMigration')}
          />
        </FormGroup>
        <Checkbox
          isChecked={state?.autoConverge}
          onChange={(checked) => {
            const setAutoConverge = setStateField('autoConverge');
            setAutoConverge(checked);
            if (checked) {
              const setCompletionTimeoutEnabled = setStateField('completionTimeout');
              setCompletionTimeoutEnabled((prev) => ({ ...prev, enabled: checked }));
            }
          }}
          label={<div className="pf-c-form__label">{t('Enable auto converge')}</div>}
          id="migration-policy-auto-converge"
          data-test-id="migration-policy-auto-converge"
        />
        <Checkbox
          isChecked={state?.postCopy}
          onChange={setStateField('postCopy')}
          label={<div className="pf-c-form__label">{t('Enable post-copy')}</div>}
          id="migration-policy-post-copy"
          data-test-id="migration-policy-post-copy"
        />
        <FormGroup fieldId="migration-policy-completion-timeout">
          <StackItem>
            <CompletionTimeoutInput
              completionTimeout={state?.completionTimeout}
              setCompletionTimeout={setStateField('completionTimeout')}
            />
          </StackItem>
        </FormGroup>
        <h2>{t('Selectors')}</h2>
        <FormGroup fieldId="migration-policy-project-selector" label={t('Project selectors')}>
          <SelectorLabelMatchGroup
            labels={state?.namespaceSelectorMatchLabel}
            setLabels={setStateField('namespaceSelectorMatchLabel')}
          />
        </FormGroup>
        <FormGroup fieldId="migration-policy-vmi-selector" label={t('VirtualMachine selectors')}>
          <SelectorLabelMatchGroup
            labels={state?.vmiSelectorMatchLabel}
            setLabels={setStateField('vmiSelectorMatchLabel')}
            isVMILabel
          />
        </FormGroup>
        <MigrationPolicyFormFooter migrationPolicy={migrationPolicy} />
      </Form>
    </div>
  );
};

export default MigrationPolicyCreateForm;
