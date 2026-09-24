import { type FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { type InstanceTypeSize } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { INSTANCETYPE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import InstanceTypeSizeDropdown from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/InstanceTypeSizeMenu/InstanceTypeSizeDropdown/InstanceTypeSizeDropdown';

type InstanceTypeSizeMenuProps = {
  instanceTypeSizes: InstanceTypeSize[];
};

const InstanceTypeSizeMenu: FC<InstanceTypeSizeMenuProps> = ({ instanceTypeSizes }) => {
  const { control } = useVMWizard();
  const selectedSeries = useWatch({
    control,
    name: 'instanceType.compute.series',
  }) as string | undefined;

  if (!instanceTypeSizes) return null;

  return (
    <div className="instance-type-series-menu-card__size-dropdown">
      <Controller
        control={control}
        name="instanceType.compute"
        render={({ field: { onChange, ref: _ref, value } }) => (
          <InstanceTypeSizeDropdown
            onSizeSelect={(size: string) => {
              logITFlowEvent(INSTANCETYPE_SELECTED, null, {
                selectedInstanceType: selectedSeries ? `${selectedSeries}.${size}` : size,
              });
              onChange({
                name: selectedSeries ? `${selectedSeries}.${size}` : size,
                series: selectedSeries ?? '',
                size,
                type: 'redhat',
              });
            }}
            selectedSize={value?.type === 'redhat' ? value.size : ''}
            seriesName={selectedSeries}
            sizes={instanceTypeSizes}
          />
        )}
      />
    </div>
  );
};

export default InstanceTypeSizeMenu;
