import React, { type FC, useState } from 'react';
import { type Updater } from 'use-immer';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Radio, StackItem } from '@patternfly/react-core';

import { type SelectedMigration } from '../../utils/constants';
import { getAllSelectedMigrations } from '../../utils/utils';
import SelectMigrationDisksTable from './SelectMigrationDisksTable';

type MigrationVolumeSelectionProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedMigrations: Updater<SelectedMigration[]>;
  vms: V1VirtualMachine[];
};

const MigrationVolumeSelection: FC<MigrationVolumeSelectionProps> = ({
  pvcs,
  selectedPVCs,
  setSelectedMigrations,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [allPVCsSelected, setAllPVCsSelected] = useState(true);

  return (
    <>
      <StackItem>
        <Radio
          id="all-volumes"
          isChecked={allPVCsSelected}
          isDisabled={isEmpty(pvcs)}
          label={t('The entire VirtualMachine')}
          name="volumes"
          onChange={(): void => {
            setAllPVCsSelected(true);
            setSelectedMigrations(getAllSelectedMigrations(vms, pvcs));
          }}
        />
        <Radio
          id="selected-volumes"
          isChecked={!allPVCsSelected}
          isDisabled={isEmpty(pvcs)}
          label={t('Selected volumes')}
          name="volumes"
          onChange={(): void => {
            setAllPVCsSelected(false);
            setSelectedMigrations([]);
          }}
        />
      </StackItem>
      {!allPVCsSelected && (
        <StackItem>
          <SelectMigrationDisksTable
            pvcs={pvcs}
            selectedPVCs={selectedPVCs}
            setSelectedMigrations={setSelectedMigrations}
            vms={vms}
          />
        </StackItem>
      )}
    </>
  );
};

export default MigrationVolumeSelection;
