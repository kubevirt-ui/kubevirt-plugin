import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Button,
  Flex,
  Form,
  FormGroup,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  ProjectDiagramIcon,
  RhUiMonitoringIcon,
  RhUiServerStackIcon,
} from '@patternfly/react-icons';

import { DEFAULT_VM_COUNT } from '../constants';

import { DeleteAllVMsListItemPart } from './DeleteAllVMsListItemPart';

type DeleteAllVMsListProps = {
  filteredVMs: V1VirtualMachine[];
  handleSearchVirtualMachines: (value: string) => void;
  hasMultipleClusters: boolean;
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
  hasMultipleClusters,
  hasMultipleNamespaces,
  searchVirtualMachines,
  setShowAll,
  showAll,
  visibleVMs,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const vmsList = visibleVMs.map((vm) => {
    const cluster = getCluster(vm);
    const namespace = getNamespace(vm);
    const name = getName(vm);

    if (!hasMultipleNamespaces && !hasMultipleClusters) {
      return (
        <StackItem aria-label={t('Name')} key={name}>
          {name}
        </StackItem>
      );
    }

    return (
      <StackItem key={`${cluster}/${namespace}/${name}`}>
        <Flex>
          {hasMultipleClusters && (
            <DeleteAllVMsListItemPart
              ariaLabel={t('Cluster')}
              icon={<RhUiServerStackIcon />}
              text={cluster}
            />
          )}

          {hasMultipleNamespaces && (
            <DeleteAllVMsListItemPart
              ariaLabel={t('Project')}
              icon={<ProjectDiagramIcon />}
              text={namespace}
            />
          )}

          <DeleteAllVMsListItemPart
            ariaLabel={t('Name')}
            icon={<RhUiMonitoringIcon />}
            text={name}
          />
        </Flex>
      </StackItem>
    );
  });

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
