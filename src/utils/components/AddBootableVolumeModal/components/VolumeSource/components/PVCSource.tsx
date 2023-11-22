import React, { FC } from 'react';
import xbytes from 'xbytes';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import DiskSourcePVCSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourcePVCSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { hasSizeUnit } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { Checkbox, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';

type PVCSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PVCSource: FC<PVCSourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const { pvcName, pvcNamespace } = bootableVolume || {};

  return (
    <>
      <DiskSourcePVCSelect
        setDiskSize={(newSize) =>
          setBootableVolumeField('size')(
            hasSizeUnit(newSize)
              ? removeByteSuffix(newSize)
              : removeByteSuffix(xbytes(Number(newSize), { iec: true, space: false })),
          )
        }
        pvcNameSelected={pvcName}
        pvcNamespaceSelected={pvcNamespace}
        selectPVCName={setBootableVolumeField('pvcName')}
        selectPVCNamespace={setBootableVolumeField('pvcNamespace')}
      />
      <Split hasGutter>
        <SplitItem>
          <Checkbox id="clone-pvc-checkbox" isChecked isDisabled label={t('Clone existing PVC')} />
        </SplitItem>
        <SplitItem>
          <HelpTextIcon
            bodyContent={t('This will create a cloned copy of the PVC in the destination project.')}
            position={PopoverPosition.right}
          />
        </SplitItem>
      </Split>
    </>
  );
};

export default PVCSource;
