import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { Grid, GridItem } from '@patternfly/react-core';

import CategoryCard from './components/category-card/components/CategoryCard/CategoryCard';
import CustomMenu from './components/category-card/components/InstanceTypesMenu/components/CustomMenu';
import { InstanceTypeCategory, InstanceTypeSize } from './utils/types';
import { categoryDetailsMap } from './utils/utils';

import './SelectInstanceTypeSection.scss';

const SelectInstanceTypeSection: FC = () => {
  const { instanceTypeVMState, setInstanceTypeVMState } = useInstanceTypeVMStore();
  const { selectedInstanceType } = instanceTypeVMState;
  const handleSelect = (category: InstanceTypeCategory, size: InstanceTypeSize) => {
    setInstanceTypeVMState({
      type: instanceTypeActionType.setSelectedInstanceType,
      payload: {
        category,
        size,
        name: `${categoryDetailsMap[category]?.prefix}.${size}`,
      },
    });
  };

  return (
    <Grid hasGutter span={3} className="categories-card">
      {Object.keys(InstanceTypeCategory)?.map((instanceType) => (
        <GridItem key={instanceType} className="categories-card__grid-item">
          <CustomMenu
            toggleComponent={CategoryCard}
            onSelect={handleSelect}
            customData={{
              category: instanceType,
              selectedCategory: selectedInstanceType?.category,
              selectedSize: selectedInstanceType?.size,
            }}
          />
        </GridItem>
      ))}
    </Grid>
  );
};

export default SelectInstanceTypeSection;
