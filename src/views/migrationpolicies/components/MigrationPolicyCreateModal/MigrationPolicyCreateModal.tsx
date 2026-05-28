import React, { FC, useMemo, useState } from 'react';

import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateDNS1123Label } from '@kubevirt-utils/utils/validation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import SelectorLabelMatchGroup from '../../list/components/MigrationPolicyCreateForm/copmonents/SelectorLabelMatchGroup/SelectorLabelMatchGroup';
import {
  InitialMigrationPolicyState,
  initialMigrationPolicyState,
  produceMigrationPolicy,
} from '../../list/components/MigrationPolicyCreateForm/utils/utils';
import MigrationPolicyConfigurations from '../MigrationPolicyConfigurations/MigrationPolicyConfigurations';

type MigrationPolicyCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MigrationPolicyCreateModal: FC<MigrationPolicyCreateModalProps> = ({ isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [state, setState] = useState(initialMigrationPolicyState);
  const [isNameTouched, setIsNameTouched] = useState(false);

  const setStateField = (field: keyof InitialMigrationPolicyState) => (value: unknown) => {
    const isValueFunction = typeof value === 'function';
    setState((prevState) => ({
      ...prevState,
      [field]: isValueFunction ? (value as (prev: unknown) => unknown)(prevState?.[field]) : value,
    }));
  };

  const migrationPolicy: V1alpha1MigrationPolicy = useMemo(
    () => produceMigrationPolicy(state),
    [state],
  );

  const migrationPolicyNameError = validateDNS1123Label(t, state.migrationPolicyName);
  const isFormValid = !!state.migrationPolicyName?.trim() && !migrationPolicyNameError;

  return (
    <TabModal<V1alpha1MigrationPolicy>
      onSubmit={() =>
        kubevirtK8sCreate({ cluster, data: migrationPolicy, model: MigrationPolicyModel })
      }
      headerText={t('Create MigrationPolicy')}
      isDisabled={!isFormValid}
      isOpen={isOpen}
      obj={migrationPolicy}
      onClose={onClose}
      shouldWrapInForm
      submitBtnText={t('Create')}
    >
      <FormGroup fieldId="migration-policy-name" isRequired label={t('MigrationPolicy name')}>
        <TextInput
          validated={
            isNameTouched && migrationPolicyNameError
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
          id="migration-policy-name"
          onBlur={() => setIsNameTouched(true)}
          onChange={(_, value) => setStateField('migrationPolicyName')(value)}
          value={state?.migrationPolicyName}
        />
        <FormGroupHelperText
          validated={isNameTouched && migrationPolicyNameError ? ValidatedOptions.error : undefined}
        >
          {isNameTouched && migrationPolicyNameError
            ? migrationPolicyNameError
            : t('Unique name of the MigrationPolicy')}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup fieldId="migration-policy-description" label={t('Description')}>
        <TextInput
          id="migration-policy-description"
          onChange={(_, value) => setStateField('description')(value)}
          value={state?.description}
        />
      </FormGroup>
      <MigrationPolicyConfigurations
        setState={setState}
        setStateField={setStateField}
        state={state}
      />
      <FormGroup fieldId="migration-policy-project-selector" label={t('Project labels')}>
        <SelectorLabelMatchGroup
          labels={state?.namespaceSelectorMatchLabel}
          setLabels={setStateField('namespaceSelectorMatchLabel')}
        />
      </FormGroup>
      <FormGroup fieldId="migration-policy-vmi-selector" label={t('VirtualMachineInstance labels')}>
        <SelectorLabelMatchGroup
          isVMILabel
          labels={state?.vmiSelectorMatchLabel}
          setLabels={setStateField('vmiSelectorMatchLabel')}
        />
      </FormGroup>
    </TabModal>
  );
};

export default MigrationPolicyCreateModal;
