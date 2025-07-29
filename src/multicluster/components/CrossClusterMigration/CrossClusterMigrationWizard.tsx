/* Copyright Contributors to the Open Cluster Management project */
import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useImmer } from 'use-immer';

import { PlanModel, V1beta1NetworkMap, V1beta1Plan, V1beta1StorageMap } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTargetNamespace,
  getTargetProviderName,
} from '@kubevirt-utils/resources/plan/selectors';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  Button,
  ButtonVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';

import ReadinessStep from './components/ReadinessStep';
import TargetStep from './components/TargetStep';
import useCrossClusterMigrationSubmit from './hooks/useCrossClusterMigrationSubmit';
import { getInitialMigrationPlan } from './utils';

import './CrossClusterMigration.scss';

const CrossClusterMigrationWizard: FC<{
  close: () => void;
  vms: V1VirtualMachine[];
}> = ({ close, vms }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const [migrationPlan, setMigrationPlan] = useImmer<V1beta1Plan>(getInitialMigrationPlan(vms));
  const [networkMap, setNetworkMap] = useImmer<V1beta1NetworkMap>(null);
  const [storageMap, setStorageMap] = useImmer<V1beta1StorageMap>(null);

  const { error, isSubmitting, onSubmit, success } = useCrossClusterMigrationSubmit(
    migrationPlan,
    setMigrationPlan,
    storageMap,
    networkMap,
  );

  return (
    <Wizard
      header={
        <WizardHeader
          description={t(
            'Choose the target location for your VirtualMachines, then adjust your migration plan if necessary',
          )}
          closeButtonAriaLabel={t('Close header')}
          onClose={close}
          title={t('Migrate VirtualMachines')}
        />
      }
      onClose={close}
      onSave={onSubmit}
    >
      <WizardStep
        footer={{
          isNextDisabled:
            isEmpty(getTargetNamespace(migrationPlan)) ||
            isEmpty(getTargetProviderName(migrationPlan)),
        }}
        id="wizard-migration-target"
        name={t('Target placement')}
      >
        <TargetStep migrationPlan={migrationPlan} setMigrationPlan={setMigrationPlan} vms={vms} />
      </WizardStep>
      <WizardStep
        footer={{
          isNextDisabled: isSubmitting || success,
          nextButtonProps: { isLoading: isSubmitting },
          nextButtonText: t('Migrate'),
        }}
        id="wizard-migration-readiness"
        name={t('Migration readiness')}
      >
        <ReadinessStep
          migrationPlan={migrationPlan}
          networkMap={networkMap}
          setMigrationPlan={setMigrationPlan}
          setNetworkMap={setNetworkMap}
          setStorageMap={setStorageMap}
          storageMap={storageMap}
          vms={vms}
        />

        {error && <ErrorAlert error={error} />}
        {success && (
          <Alert title={t('Migration plan created')} variant="success">
            <p>{t('The migration plan has been created successfully')}</p>
            <Button
              onClick={() => {
                navigate(getResourceUrl({ model: PlanModel, resource: migrationPlan }));
                close();
              }}
              variant={ButtonVariant.link}
            >
              {t('View migration plan')}
            </Button>
          </Alert>
        )}
      </WizardStep>
    </Wizard>
  );
};

export default CrossClusterMigrationWizard;
