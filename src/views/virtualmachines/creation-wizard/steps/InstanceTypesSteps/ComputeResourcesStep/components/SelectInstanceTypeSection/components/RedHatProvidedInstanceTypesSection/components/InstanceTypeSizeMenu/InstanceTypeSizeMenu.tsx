import React, { FCC } from 'react';

import { InstanceTypeSize } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { INSTANCETYPE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import InstanceTypeSizeDropdown from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/InstanceTypeSizeMenu/InstanceTypeSizeDropdown/InstanceTypeSizeDropdown';

type InstanceTypeSizeMenuProps = {
  instanceTypeSizes: InstanceTypeSize[];
};

const InstanceTypeSizeMenu: FCC<InstanceTypeSizeMenuProps> = ({ instanceTypeSizes }) => {
  const { selectedSeries, selectedSize, setSelectedSize } = useInstanceTypeVMStore();

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    logITFlowEvent(INSTANCETYPE_SELECTED, null, {
      selectedInstanceType: selectedSeries ? `${selectedSeries}.${size}` : size,
    });
  };

  if (!instanceTypeSizes) return null;

  return (
    <div className="instance-type-series-menu-card__size-dropdown">
      <InstanceTypeSizeDropdown
        onSizeSelect={handleSizeSelect}
        selectedSize={selectedSize}
        seriesName={selectedSeries}
        sizes={instanceTypeSizes}
      />
    </div>
  );
};

export default InstanceTypeSizeMenu;
