import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, ModalVariant, Stack, StackItem } from '@patternfly/react-core';
import { migrateVM } from '@virtualmachines/actions/actions';
import MigrationOptionRadioGroup from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/MigrationOptionRadioGroup';
import NodesTable from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/NodesTable';
import { MigrationOptions } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

import './ComputeMigrationModal.scss';

type ComputeMigrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const ComputeMigrationModal: FC<ComputeMigrationModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();

  const [migrationOption, setMigrationOption] = useState<MigrationOptions>(
    MigrationOptions.AUTOMATIC,
  );

  const [selectedNode, setSelectedNode] = useState<string>('');

  const handleNodeSelection = (changedNode: string) => {
    setSelectedNode(changedNode);
  };

  const isMigrateDisabled = migrationOption === MigrationOptions.MANUAL && !selectedNode;

  return (
    <TabModal
      onSubmit={async () => {
        await migrateVM(vm, migrationOption === MigrationOptions.MANUAL ? selectedNode : undefined);
      }}
      headerDescription={t('Select the target Node to migrate your VirtualMachine to.')}
      headerText={t('Migrate VirtualMachine to a different Node')}
      isDisabled={isMigrateDisabled}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      obj={vm}
      onClose={onClose}
      positionTop={false}
      submitBtnText={t('Migrate VirtualMachine')}
    >
      <Stack hasGutter>
        <StackItem>
          <MigrationOptionRadioGroup
            migrationOption={migrationOption}
            setMigrationOption={setMigrationOption}
          />
        </StackItem>
        {migrationOption === MigrationOptions.MANUAL && (
          <StackItem>
            <Alert isInline title={t('Manual node selection')} variant={AlertVariant.info}>
              {t(
                'The listed nodes may not meet scheduling constraints such as node selectors, affinity rules, or topology constraints set on the VirtualMachine. Migrating to an unsuitable node will fail. It is your responsibility to ensure the selected node can run the workload.',
              )}
            </Alert>
          </StackItem>
        )}
        <StackItem className="compute-migration-modal__table-container">
          {migrationOption === MigrationOptions.MANUAL ? (
            <NodesTable
              handleNodeSelection={handleNodeSelection}
              selectedNode={selectedNode}
              vm={vm}
            />
          ) : (
            <div className="compute-migration-modal__placeholder" />
          )}
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default ComputeMigrationModal;
