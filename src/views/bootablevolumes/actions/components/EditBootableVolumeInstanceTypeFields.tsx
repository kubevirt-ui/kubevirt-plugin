// Extracted from EditBootableVolumesModal.tsx
// Root: src/views/bootablevolumes/actions/components/EditBootableVolumesModal.tsx

import { type FC, type ReactNode } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, Grid, GridItem, PopoverPosition, SelectOption } from '@patternfly/react-core';
import {
  type CategoryDetails,
  InstanceTypeCategory,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/types';
import { categoryDetailsMap } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/utils';

type EditBootableVolumeInstanceTypeFieldsProps = {
  instanceType: string;
  instanceTypes: CategoryDetails['instanceTypes'];
  onInstanceTypeSelect: (event: unknown, newInstanceType: string) => void;
  onSizeSelect: (event: unknown, newSize: string) => void;
  size: string;
};

const EditBootableVolumeInstanceTypeFields: FC<EditBootableVolumeInstanceTypeFieldsProps> = ({
  instanceType,
  instanceTypes,
  onInstanceTypeSelect,
  onSizeSelect,
  size,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid hasGutter>
      <GridItem span={6}>
        <FormGroup
          label={t('Default InstanceType')}
          labelHelp={
            <HelpTextIcon
              bodyContent={(hide: () => void): ReactNode => (
                <PopoverContentWithLightspeedButton
                  content={t('The default InstanceType for this volume.')}
                  hide={hide}
                  promptType={OLSPromptType.DEFAULT_INSTANCETYPE}
                />
              )}
              position={PopoverPosition.right}
            />
          }
        >
          <FormPFSelect onSelect={onInstanceTypeSelect} selected={instanceType}>
            {Object.values(InstanceTypeCategory).map((instanceTypeCategory) => {
              const { seriesLabel, title } = categoryDetailsMap[instanceTypeCategory];
              return (
                <SelectOption
                  description={title}
                  key={instanceTypeCategory}
                  value={instanceTypeCategory}
                >
                  {seriesLabel}
                </SelectOption>
              );
            })}
          </FormPFSelect>
        </FormGroup>
      </GridItem>
      <GridItem span={6}>
        <FormGroup label={t('Size')}>
          <FormPFSelect onSelect={onSizeSelect} selected={size}>
            {instanceTypes?.map(({ cpus, label, memory }) => (
              <SelectOption
                description={t('{{cpus}} CPUs, {{memory}} Memory', {
                  cpus,
                  memory: readableSizeUnit(memory),
                })}
                key={label}
                value={label}
              >
                {label}
              </SelectOption>
            ))}
          </FormPFSelect>
        </FormGroup>
      </GridItem>
    </Grid>
  );
};

export default EditBootableVolumeInstanceTypeFields;
