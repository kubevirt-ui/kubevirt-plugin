/* Copyright Contributors to the Open Cluster Management project */
import { FC, useMemo } from 'react';
import React from 'react';
import { useImmer } from 'use-immer';

import { V1beta1Plan } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTargetCluster, getTargetNamespace } from '@kubevirt-utils/resources/plan/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Modal, ModalBody, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

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

  const vms = useMemo(() => (resource ? [resource] : resources), [resource, resources]);

  const [migrationPlan, setMigrationPlan] = useImmer<V1beta1Plan>(
    getInitialMigrationPlan([resource]),
  );

  const loadingError = undefined;

  return (
    <Modal
      className="virtual-machine-migration-modal"
      id="virtual-machine-migration-modal"
      isOpen={isOpen}
      variant="large"
    >
      <ModalBody>
        <StateHandler error={loadingError} hasData loaded>
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
            onSave={() => {}}
          >
            <WizardStep
              footer={{
                isNextDisabled:
                  isEmpty(getTargetNamespace(migrationPlan)) ||
                  isEmpty(getTargetCluster(migrationPlan)),
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
            <WizardStep id="wizard-migration-readiness" name={t('Migration readiness')}>
              <ReadinessStep
                migrationPlan={migrationPlan}
                setMigrationPlan={setMigrationPlan}
                vms={vms}
              />
            </WizardStep>
          </Wizard>
        </StateHandler>
      </ModalBody>
    </Modal>
  );
};

export default CrossClusterMigration;
