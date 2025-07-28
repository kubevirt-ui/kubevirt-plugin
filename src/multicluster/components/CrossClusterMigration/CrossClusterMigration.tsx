/* Copyright Contributors to the Open Cluster Management project */
import { FC, useMemo, useState } from 'react';
import React from 'react';
import { useImmer } from 'use-immer';

import {
  NetworkMapModel,
  PlanModel,
  StorageMapModel,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTargetNamespace,
  getTargetProviderName,
} from '@kubevirt-utils/resources/plan/selectors';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { Alert, Modal, ModalBody, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import ReadinessStep from './components/ReadinessStep';
import TargetStep from './components/TargetStep';
import { getInitialMigrationPlan } from './utils';

import './CrossClusterMigration.scss';

const CrossClusterMigration: FC<{
  close: () => void;
  isOpen?: boolean;
  resource: V1VirtualMachine;
  resources: V1VirtualMachine[];
}> = ({ close, isOpen = true, resource, resources }) => {
  const { t } = useKubevirtTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const vms = useMemo(() => (resource ? [resource] : resources), [resource, resources]);

  const [migrationPlan, setMigrationPlan] = useImmer<V1beta1Plan>(
    getInitialMigrationPlan([resource]),
  );

  const [networkMap, setNetworkMap] = useImmer<V1beta1NetworkMap>(null);
  const [storageMap, setStorageMap] = useImmer<V1beta1StorageMap>(null);

  const onSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const finalStorageMap = {
        ...storageMap,
        provider: migrationPlan.spec.provider,
      };

      const finalNetworkMap = {
        ...networkMap,
        provider: migrationPlan.spec.provider,
      };

      const createdStorageMap = await kubevirtK8sCreate({
        data: finalStorageMap,
        model: StorageMapModel,
      });
      const createdNetworkMap = await kubevirtK8sCreate({
        data: finalNetworkMap,
        model: NetworkMapModel,
      });

      const finalMigrationPlan: V1beta1Plan = {
        ...migrationPlan,
        spec: {
          ...migrationPlan.spec,
          map: {
            network: {
              apiVersion: networkMap.apiVersion,
              kind: networkMap.kind,
              name: getName(networkMap),
              namespace: getNamespace(networkMap),
              uid: getUID(createdNetworkMap),
            },
            storage: {
              apiVersion: storageMap.apiVersion,
              kind: storageMap.kind,
              name: getName(storageMap),
              namespace: getNamespace(storageMap),
              uid: getUID(createdStorageMap),
            },
          },
        },
      };

      await kubevirtK8sCreate({
        data: finalMigrationPlan,
        model: PlanModel,
      });
    } catch (apiError) {
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      variant="large"
    >
      <ModalBody>
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
            <TargetStep
              migrationPlan={migrationPlan}
              setMigrationPlan={setMigrationPlan}
              vms={vms}
            />
          </WizardStep>
          <WizardStep
            footer={{
              isNextDisabled: isSubmitting,
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

            {error && <Alert title={t('Error')} variant="danger" />}
          </WizardStep>
        </Wizard>
      </ModalBody>
    </Modal>
  );
};

export default CrossClusterMigration;
