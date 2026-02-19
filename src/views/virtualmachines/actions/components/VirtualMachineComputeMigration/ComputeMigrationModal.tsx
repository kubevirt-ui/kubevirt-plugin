import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  const handleNodeSelection = (changedNode: string) => {
    changedNode === selectedNode ? setSelectedNode('') : setSelectedNode(changedNode);
  };

  const initiateMigration = async () => {
    setError(null);

    try {
      setLoading(true);
      await migrateVM(vm, migrationOption === MigrationOptions.MANUAL ? selectedNode : undefined);
      onClose();
    } catch (err) {
      setError(err);
      kubevirtConsole.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isMigrateDisabled =
    loading || (migrationOption === MigrationOptions.MANUAL && !selectedNode);

  return (
    <Modal
      className="compute-migration-modal"
      height="650px"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <ModalHeader>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1">{t('Migrate VirtualMachine to a different Node')}</Title>
          </StackItem>
          <StackItem>
            <Title headingLevel="h2" size={TitleSizes.md}>
              {t('Select the target Node to migrate your VirtualMachine to.')}
            </Title>
          </StackItem>
        </Stack>
      </ModalHeader>
      <ModalBody>
        <Stack hasGutter>
          {error && (
            <StackItem>
              <ErrorAlert error={error} />
            </StackItem>
          )}
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
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isMigrateDisabled} isLoading={loading} onClick={initiateMigration}>
          {t('Migrate VirtualMachine')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ComputeMigrationModal;
