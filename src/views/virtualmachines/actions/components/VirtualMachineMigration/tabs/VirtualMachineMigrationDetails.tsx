import React, { Dispatch, FC, SetStateAction } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Radio, Stack, StackItem, Text, TextVariants, Title } from '@patternfly/react-core';

import { entireVMSelected } from '../utils';

import SelectMigrationDisksTable from './components/SelectMigrationDisksTable';

type VirtualMachineMigrationDetailsProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedPVCs: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>;
  vm: V1VirtualMachine;
};

const VirtualMachineMigrationDetails: FC<VirtualMachineMigrationDetailsProps> = ({
  pvcs,
  selectedPVCs,
  setSelectedPVCs,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const allVolumes = entireVMSelected(selectedPVCs);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Migration details')}</Title>
        <Text component={TextVariants.p}>
          {t('Select the storage to migrate for')}
          <ResourceLink
            groupVersionKind={VirtualMachineModelGroupVersionKind}
            inline
            name={getName(vm)}
            namespace={getNamespace(vm)}
          />
        </Text>
      </StackItem>
      <StackItem>
        <Radio
          id="all-volumes"
          isChecked={allVolumes}
          label={t('The entire VirtualMachine')}
          name="volumes"
          onChange={() => setSelectedPVCs(null)}
        />
        <Radio
          id="selected-volumes"
          isChecked={!allVolumes}
          label={t('Selected volumes')}
          name="volumes"
          onChange={() => setSelectedPVCs(pvcs)}
        />
      </StackItem>
      {!allVolumes && (
        <StackItem>
          <SelectMigrationDisksTable
            pvcs={pvcs}
            selectedPVCs={selectedPVCs}
            setSelectedPVCs={setSelectedPVCs}
            vm={vm}
          />
        </StackItem>
      )}
    </Stack>
  );
};

export default VirtualMachineMigrationDetails;
