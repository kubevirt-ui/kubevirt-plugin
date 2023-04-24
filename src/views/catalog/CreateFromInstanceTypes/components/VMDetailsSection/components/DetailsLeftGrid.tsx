import React, { FC, useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionList, TextInput } from '@patternfly/react-core';

import { getCPUAndMemoryFromDefaultInstanceType, getOSFromDefaultPreference } from '../utils/utils';

const DetailsLeftGrid: FC = () => {
  const { t } = useKubevirtTranslation();
  const { instanceTypeVMState, setInstanceTypeVMState, instanceTypesAndPreferencesData } =
    useInstanceTypeVMStore();
  const { vmName, selectedBootableVolume, selectedInstanceType } = instanceTypeVMState;
  const { preferences, instanceTypes } = instanceTypesAndPreferencesData;
  const { name } = selectedInstanceType;

  const preferencesMap = useMemo(() => convertResourceArrayToMap(preferences), [preferences]);
  const instanceTypesMap = useMemo(() => convertResourceArrayToMap(instanceTypes), [instanceTypes]);

  const operatingSystem = getOSFromDefaultPreference(selectedBootableVolume, preferencesMap);
  const cpuMemoryString = !isEmpty(instanceTypesMap?.[name])
    ? getCPUAndMemoryFromDefaultInstanceType(instanceTypesMap[name])
    : null;

  return (
    <DescriptionList isHorizontal>
      <VirtualMachineDescriptionItem
        descriptionData={
          <TextInput
            isRequired
            type="text"
            data-test-id="instancetypes-vm-name-input"
            name="vmname"
            aria-label="instancetypes virtualmachine name"
            value={vmName}
            onChange={(newVMName) =>
              setInstanceTypeVMState({ type: instanceTypeActionType.setVMName, payload: newVMName })
            }
          />
        }
        descriptionHeader={t('Name')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={operatingSystem}
        descriptionHeader={t('Operating system')}
      />
      <VirtualMachineDescriptionItem descriptionData={name} descriptionHeader={t('InstanceType')} />
      <VirtualMachineDescriptionItem
        descriptionData={cpuMemoryString}
        descriptionHeader={t('CPU | Memory')}
      />
    </DescriptionList>
  );
};

export default DetailsLeftGrid;
