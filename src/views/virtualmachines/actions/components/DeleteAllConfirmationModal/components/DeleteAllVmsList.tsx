import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Button, Form, FormGroup, SearchInput, Stack, StackItem } from '@patternfly/react-core';

import { DEFAULT_VM_COUNT } from '../constants';

type DeleteAllVMsListProps = {
  filteredVMs: V1VirtualMachine[];
  handleSearchVirtualMachines: (value: string) => void;
  hasMultipleNamespaces: boolean;
  searchVirtualMachines: string;
  setShowAll: (value: boolean) => void;
  showAll: boolean;
  visibleVMs: V1VirtualMachine[];
  vms: V1VirtualMachine[];
};

const DeleteAllVMsList: FC<DeleteAllVMsListProps> = ({
  filteredVMs,
  handleSearchVirtualMachines,
  hasMultipleNamespaces,
  searchVirtualMachines,
  setShowAll,
  showAll,
  visibleVMs,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const vmsList = visibleVMs.map((vm) => (
    <StackItem key={`${getNamespace(vm)}/${getName(vm)}`}>
      {hasMultipleNamespaces ? `${getNamespace(vm)}/ ` : ''}
      {getName(vm)}
    </StackItem>
  ));

  return (
    <Form>
      <FormGroup label={t('VirtualMachines being deleted')}>
        <div className="delete-all-vms">
          <Stack hasGutter>
            {vms.length > DEFAULT_VM_COUNT && (
              <StackItem>
                <SearchInput
                  aria-label={t('Search VirtualMachines')}
                  onChange={(_event, value) => handleSearchVirtualMachines(value)}
                  onClear={() => handleSearchVirtualMachines('')}
                  placeholder={t('Find by name')}
                  value={searchVirtualMachines}
                />
              </StackItem>
            )}
            <StackItem>{vmsList}</StackItem>
            {filteredVMs.length > DEFAULT_VM_COUNT && (
              <StackItem>
                <Button
                  className="delete-all-vms__show-all-button"
                  isInline
                  onClick={() => setShowAll(!showAll)}
                  variant="link"
                >
                  {showAll
                    ? t('Show less')
                    : t('Show all {{count}} VirtualMachines', { count: filteredVMs.length })}
                </Button>
              </StackItem>
            )}
          </Stack>
        </div>
      </FormGroup>
    </Form>
  );
};

export default DeleteAllVMsList;
