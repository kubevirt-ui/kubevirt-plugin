import React, { type FC, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { useMigrationPoliciesListURL } from '../../hooks/useMigrationPoliciesListURL';
import { getMigrationPolicyURL } from '../../utils/utils';
import MigrationPolicyConfigurations from '../MigrationPolicyConfigurations/MigrationPolicyConfigurations';
import {
  type EditMigrationPolicyInitialState,
  type MigrationPolicyStateDispatch,
} from './utils/constants';
import {
  extractEditMigrationPolicyInitialValues,
  produceUpdatedMigrationPolicy,
} from './utils/utils';

type MigrationPolicyEditModalProps = {
  isOpen: boolean;
  mp: V1alpha1MigrationPolicy;
  onClose: () => void;
};

const MigrationPolicyEditModal: FC<MigrationPolicyEditModalProps> = ({ isOpen, mp, onClose }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const cluster = useClusterParam();
  const migrationPoliciesBaseURL = useMigrationPoliciesListURL();
  const [state, setState] = useState<EditMigrationPolicyInitialState>(() =>
    extractEditMigrationPolicyInitialValues(mp),
  );

  const actualPathArray = location.pathname.split('/');
  const lastPolicyPathElement = actualPathArray[actualPathArray.length - 1]; // last part of url after "/", MigrationPolicy's previous name or ''

  const setStateField =
    (field: string) =>
    (
      value:
        | ((prev: MigrationPolicyStateDispatch) => MigrationPolicyStateDispatch)
        | MigrationPolicyStateDispatch,
    ): void => {
      setState((prevState) => ({
        ...prevState,
        [field]:
          typeof value === 'function'
            ? value(prevState?.[field] as MigrationPolicyStateDispatch)
            : value,
      }));
    };

  const updatedMigrationPolicy: V1alpha1MigrationPolicy = useMemo(
    () => produceUpdatedMigrationPolicy(mp, state),
    [mp, state],
  );

  const onSubmit = (
    updatedMP: V1alpha1MigrationPolicy,
  ): Promise<V1alpha1MigrationPolicy | void> => {
    if (updatedMP?.metadata?.name !== mp?.metadata?.name) {
      return kubevirtK8sCreate({ cluster, data: updatedMP, model: MigrationPolicyModel })
        .then(() => kubevirtK8sDelete({ cluster, model: MigrationPolicyModel, resource: mp }))
        .then(() => {
          if (lastPolicyPathElement === mp?.metadata?.name) {
            void navigate(getMigrationPolicyURL(getName(updatedMP), cluster));
          } else {
            void navigate(migrationPoliciesBaseURL);
          }
          return;
        });
    }
    return kubevirtK8sUpdate({
      cluster,
      data: updatedMP,
      model: MigrationPolicyModel,
    });
  };

  return (
    <TabModal
      headerText={t('Edit MigrationPolicy')}
      isOpen={isOpen}
      obj={updatedMigrationPolicy}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      <FormGroup fieldId="migration-policy-name" isRequired label={t('MigrationPolicy name')}>
        <TextInput
          onChange={(_event, value) => setStateField('migrationPolicyName')(value)}
          value={state?.migrationPolicyName}
        />
        <FormGroupHelperText>{t('Unique name of the MigrationPolicy')}</FormGroupHelperText>
      </FormGroup>
      <MigrationPolicyConfigurations
        setState={setState}
        setStateField={setStateField}
        state={state}
      />
    </TabModal>
  );
};

export default MigrationPolicyEditModal;
