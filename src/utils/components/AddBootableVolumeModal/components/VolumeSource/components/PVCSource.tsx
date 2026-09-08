import React, { type FC } from 'react';

import {
  type AddBootableVolumeState,
  type SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import PVCClonePermissionAlert from '@kubevirt-utils/components/PVCClonePermissionAlert/PVCClonePermissionAlert';
import useCanClonePVCFromNamespace from '@kubevirt-utils/hooks/useCanClonePVCFromNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Checkbox, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';

import DiskSourcePVCSelect from './DiskSourcePVCSelect';

type PVCSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const PVCSource: FC<PVCSourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const { bootableVolumeCluster, bootableVolumeNamespace, pvcName, pvcNamespace } =
    bootableVolume || {};

  const { canClone, isChecking, requiresClonePermission } = useCanClonePVCFromNamespace(
    pvcNamespace,
    bootableVolumeNamespace,
    bootableVolumeCluster,
  );

  const showClonePermissionError =
    requiresClonePermission && !isChecking && !canClone && Boolean(pvcNamespace);

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
      {showClonePermissionError && <PVCClonePermissionAlert sourceNamespace={pvcNamespace} />}
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
            bodyContent={(hide) => (
              <PopoverContentWithLightspeedButton
                content={t(
                  'This will create a cloned copy of the Volume in the destination project.',
                )}
                hide={hide}
                promptType={OLSPromptType.CLONE_VOLUME}
              />
            )}
            position={PopoverPosition.right}
          />
        </SplitItem>
      </Split>
    </>
  );
};

export default PVCSource;
