import React, { Dispatch, SetStateAction, useMemo } from 'react';

import { InstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { DescriptionList, TextInput } from '@patternfly/react-core';
import VirtualMachineDescriptionItem from '@virtualmachines/details/tabs/details/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import useInstanceTypesAndPreferences from '../../../../../hooks/useInstanceTypesAndPreferences';
import { InstanceTypeSizeDetails } from '../../../../SelectInstanceTypeSection/utils/types';
import {
  getCPUMemoryString,
  getInstancetypeDetails,
  getInstancetypeString,
} from '../../../../SelectInstanceTypeSection/utils/utils';
import { getOSFromDefaultPreference } from '../../../utils/utils';

type DetailsLeftGridProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  bootSource: V1beta1DataSource;
  instancetype: InstanceTypeState;
};

const DetailsLeftGrid: React.FC<DetailsLeftGridProps> = ({
  bootSource,
  instancetype,
  vmName,
  setVMName,
}) => {
  const { t } = useKubevirtTranslation();
  const { preferences } = useInstanceTypesAndPreferences();
  const preferencesMap = useMemo(() => convertResourceArrayToMap(preferences), [preferences]);
  const operatingSystem = getOSFromDefaultPreference(bootSource, preferencesMap);

  const { category, size } = instancetype;
  const instancetypeSize: InstanceTypeSizeDetails = getInstancetypeDetails(category, size);

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
      <VirtualMachineDescriptionItem
        descriptionData={getInstancetypeString(instancetype?.category, instancetype?.size)}
        descriptionHeader={t('InstanceType')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={getCPUMemoryString(instancetypeSize, t)}
        descriptionHeader={t('CPU | Memory')}
      />
    </DescriptionList>
  );
};

export default DetailsLeftGrid;
