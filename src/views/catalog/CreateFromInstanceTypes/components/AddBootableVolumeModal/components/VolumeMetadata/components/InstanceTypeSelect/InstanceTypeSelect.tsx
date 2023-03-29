import React, { ChangeEvent, FC, useMemo, useState } from 'react';

import {
  CategoryDetails,
  InstanceTypeCategory,
} from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/types';
import { categoryDetailsMap } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/utils';
import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  FormGroup,
  Grid,
  GridItem,
  PopoverPosition,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

type InstanceTypeSelectProps = {
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
};

const InstanceTypeSelect: FC<InstanceTypeSelectProps> = ({ setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCategorySizeOpen, setIsCategorySizeOpen] = useState(false);
  const [category, setCategory] = useState<string>();
  const [categorySize, setCategorySize] = useState<string>();

  // update options for 'Size' dropdown according to chosen 'category' in 'Default InstanceType' dropdown
  const { instanceTypes, prefix }: CategoryDetails = useMemo(
    () => (category ? categoryDetailsMap[category] : {}),
    [category],
  );

  const onCategorySelect = (event: ChangeEvent<HTMLSelectElement>, newCategory: string) => {
    setCategory(newCategory);
    setIsCategoryOpen(false);

    // when setting category, we need to set also some default categorySize, because the instanceType label on a bootable volume cannot be without that
    const newCategoryObject = categoryDetailsMap[newCategory];
    const newCategorySize = newCategoryObject.instanceTypes[0].label;
    setCategorySize(newCategorySize);
    setBootableVolumeField(
      'labels',
      DEFAULT_INSTANCETYPE_LABEL,
    )(`${newCategoryObject.prefix}.${newCategorySize}`);
  };

  const onCategorySizeSelect = (event: ChangeEvent<HTMLSelectElement>, newCategorySize: string) => {
    setCategorySize(newCategorySize);
    setIsCategorySizeOpen(false);
    setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_LABEL)(`${prefix}.${newCategorySize}`);
  };
  return (
    <Grid hasGutter span={12}>
      <GridItem span={6}>
        <FormGroup
          label={
            <>
              {t('Default InstanceType')}{' '}
              <HelpTextIcon
                bodyContent={t('The default InstanceType for this volume.')}
                position={PopoverPosition.right}
              />
            </>
          }
        >
          <Select
            menuAppendTo="parent"
            isOpen={isCategoryOpen}
            onToggle={setIsCategoryOpen}
            onSelect={onCategorySelect}
            variant={SelectVariant.single}
            placeholderText={t('Select InstanceType')}
            selections={category}
          >
            {Object.keys(InstanceTypeCategory)?.map((instanceType) => {
              const { seriesLabel, title }: CategoryDetails = categoryDetailsMap[instanceType];
              return (
                <SelectOption key={instanceType} value={instanceType} description={title}>
                  {seriesLabel}
                </SelectOption>
              );
            })}
          </Select>
        </FormGroup>
      </GridItem>
      <GridItem span={6}>
        <FormGroup label={t('Size')}>
          <Select
            menuAppendTo="parent"
            isOpen={isCategorySizeOpen}
            onToggle={setIsCategorySizeOpen}
            onSelect={onCategorySizeSelect}
            variant={SelectVariant.single}
            placeholderText={t('Select size')}
            selections={categorySize}
          >
            {instanceTypes?.map(({ label, cpus, memory }) => (
              <SelectOption
                key={label}
                value={label}
                description={t('{{cpus}} CPUs, {{memory}} Memory', {
                  cpus,
                  memory: readableSizeUnit(memory),
                })}
              >
                {label}
              </SelectOption>
            ))}
          </Select>
        </FormGroup>
      </GridItem>
    </Grid>
  );
};

export default InstanceTypeSelect;
