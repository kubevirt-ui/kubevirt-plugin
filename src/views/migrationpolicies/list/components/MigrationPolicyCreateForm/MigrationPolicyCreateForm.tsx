import React, { FC, JSX, useMemo, useState } from 'react';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import MigrationPolicyConfigurations from '../../../components/MigrationPolicyConfigurations/MigrationPolicyConfigurations';

import MigrationPolicyCreateFormHeader from './copmonents/MigrationPolicyCreateFormHeader/MigrationPolicyCreateFormHeader';
import MigrationPolicyFormDescription from './copmonents/MigrationPolicyFormDescription/MigrationPolicyFormDescription';
import MigrationPolicyFormFooter from './copmonents/MigrationPolicyFormFooter/MigrationPolicyFormFooter';
import SelectorLabelMatchGroup from './copmonents/SelectorLabelMatchGroup/SelectorLabelMatchGroup';
import { initialMigrationPolicyState, produceMigrationPolicy } from './utils/utils';

import './MigrationPolicyCreateForm.scss';
import '@kubevirt-utils/styles/forms.scss';

const MigrationPolicyCreateForm: FC = (): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [state, setState] = useState(initialMigrationPolicyState);

  const setStateField = (field: string) => (value: unknown) => {
    const isValueFunction = typeof value === 'function';
    setState((prevState) => ({
      ...prevState,
      [field]: isValueFunction ? (value as (prev: unknown) => unknown)(prevState?.[field]) : value,
    }));
  };
  const migrationPolicy = useMemo(() => produceMigrationPolicy(state), [state]);

  return (
    <div className="migration-policy__form kv-m-pane__form">
      <DocumentTitle>{t('Create MigrationPolicy')}</DocumentTitle>
      {isACMPage && (
        <ClusterProjectDropdown includeAllClusters={false} showProjectDropdown={false} />
      )}
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
