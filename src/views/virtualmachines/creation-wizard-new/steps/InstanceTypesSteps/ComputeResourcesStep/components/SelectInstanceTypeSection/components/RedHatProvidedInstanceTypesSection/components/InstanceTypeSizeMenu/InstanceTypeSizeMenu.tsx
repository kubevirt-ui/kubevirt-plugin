import React, { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { InstanceTypeSize } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { INSTANCETYPE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import InstanceTypeSizeDropdown from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/InstanceTypeSizeMenu/InstanceTypeSizeDropdown/InstanceTypeSizeDropdown';

type InstanceTypeSizeMenuProps = {
  instanceTypeSizes: InstanceTypeSize[];
};

const InstanceTypeSizeMenu: FC<InstanceTypeSizeMenuProps> = ({ instanceTypeSizes }) => {
  const { control, setValue } = useVMWizard();
  const selectedSeries = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_SERIES,
  });

  if (!instanceTypeSizes) return null;

  return (
    <div className="instance-type-series-menu-card__size-dropdown">
      <Controller
        render={({ field: { onChange, ref: _, value } }) => (
          <InstanceTypeSizeDropdown
            onSizeSelect={(size: string) => {
              onChange(size);
              logITFlowEvent(INSTANCETYPE_SELECTED, null, {
                selectedInstanceType: selectedSeries ? `${selectedSeries}.${size}` : size,
              });
              setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_INSTANCE_TYPE, {
                name: selectedSeries ? `${selectedSeries}.${size}` : size,
                namespace: null,
              });
            }}
            selectedSize={value}
            seriesName={selectedSeries}
            sizes={instanceTypeSizes}
          />
        )}
        control={control}
        name={CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_SIZE}
      />
    </div>
  );
};

export default InstanceTypeSizeMenu;
