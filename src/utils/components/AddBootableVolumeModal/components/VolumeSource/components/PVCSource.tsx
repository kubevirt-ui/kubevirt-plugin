import React, { FC } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';

import DiskSourcePVCSelect from './DiskSourcePVCSelect';

type PVCSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PVCSource: FC<PVCSourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const { bootableVolumeCluster, pvcName, pvcNamespace } = bootableVolume || {};

  return (
    <>
      <DiskSourcePVCSelect
        cluster={bootableVolumeCluster}
        pvcNameSelected={pvcName}
        pvcNamespaceSelected={pvcNamespace}
        selectPVCName={setBootableVolumeField('pvcName')}
        selectPVCNamespace={setBootableVolumeField('pvcNamespace')}
        setDiskSize={(newSize) => setBootableVolumeField('size')(newSize)}
      />
      <Split hasGutter>
        <SplitItem>
          <Checkbox
            id="clone-pvc-checkbox"
            isChecked
            isDisabled
            label={t('Clone existing Volume')}
          />
        </SplitItem>
        <SplitItem>
          <HelpTextIcon
            bodyContent={t(
              'This will create a cloned copy of the Volume in the destination project.',
            )}
            position={PopoverPosition.right}
          />
        </SplitItem>
      </Split>
    </>
  );
};

export default PVCSource;
