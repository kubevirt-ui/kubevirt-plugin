import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate, k8sDelete, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import MigrationPolicyConfigurationsFormGroup from '../MigrationPolicyConfigurationsFormGroup/MigrationPolicyConfigurationsFormGroup';

import { EditMigrationPolicyInitialState } from './utils/constants';
import {
  extractEditMigrationPolicyInitialValues,
  produceUpdatedMigrationPolicy,
} from './utils/utils';

type MigrationPolicyEditModalProps = {
  mp: V1alpha1MigrationPolicy;
  isOpen: boolean;
  onClose: () => void;
};

const MigrationPolicyEditModal: React.FC<MigrationPolicyEditModalProps> = ({
  mp,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const [state, setState] = useState<EditMigrationPolicyInitialState>(
    extractEditMigrationPolicyInitialValues(mp),
  );

  const setStateField = (field: string) => (value: any) => {
    const isValueFunction = typeof value === 'function';
    setState((prevState) => ({
      ...prevState,
      [field]: isValueFunction ? value(prevState?.[field]) : value,
    }));
  };

  const updatedMigrationPolicy: V1alpha1MigrationPolicy = useMemo(
    () => produceUpdatedMigrationPolicy(mp, state),
    [mp, state],
  );

  const onSubmit = (updatedMP: V1alpha1MigrationPolicy) => {
    if (updatedMP?.metadata?.name !== mp?.metadata?.name) {
      return k8sCreate({ model: MigrationPolicyModel, data: updatedMP }).then(() => {
        return k8sDelete({ model: MigrationPolicyModel, resource: mp }).then(() => {
          if (history?.location?.pathname?.includes(mp?.metadata?.name)) {
            history.push(
              history.location.pathname.replace(mp?.metadata?.name, updatedMP?.metadata?.name),
            );
          }
        });
      });
    }
    return k8sUpdate({
      model: MigrationPolicyModel,
      data: updatedMP,
    });
  };

  return (
    <TabModal
      obj={updatedMigrationPolicy}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Edit MigrationPolicy')}
      onSubmit={onSubmit}
    >
      <Form>
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
        <MigrationPolicyConfigurationsFormGroup state={state} setStateField={setStateField} />
      </Form>
    </TabModal>
  );
};

export default MigrationPolicyEditModal;
