import React, { Dispatch, SetStateAction, useMemo } from 'react';

import { InstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionList, TextInput } from '@patternfly/react-core';
import VirtualMachineDescriptionItem from '@virtualmachines/details/tabs/details/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import useInstanceTypesAndPreferences from '../../../../../hooks/useInstanceTypesAndPreferences';
import {
  getCPUAndMemoryFromDefaultInstanceType,
  getOSFromDefaultPreference,
} from '../../../utils/utils';

type DetailsLeftGridProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  bootSource: BootableVolume;
  instancetype: InstanceTypeState;
};

const DetailsLeftGrid: React.FC<DetailsLeftGridProps> = ({
  bootSource,
  instancetype,
  vmName,
  setVMName,
}) => {
  const { t } = useKubevirtTranslation();
  const { preferences, instanceTypes } = useInstanceTypesAndPreferences();

  const { name } = instancetype;

  const preferencesMap = useMemo(() => convertResourceArrayToMap(preferences), [preferences]);
  const instanceTypesMap = useMemo(() => convertResourceArrayToMap(instanceTypes), [instanceTypes]);

  const operatingSystem = getOSFromDefaultPreference(bootSource, preferencesMap);
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
            onChange={setVMName}
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
