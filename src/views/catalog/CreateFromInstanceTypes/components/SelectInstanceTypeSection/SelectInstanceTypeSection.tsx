import React, { useState } from 'react';

import { Grid, GridItem } from '@patternfly/react-core';

import CategoryCard from './components/category-card/components/CategoryCard/CategoryCard';
import CustomMenu from './components/category-card/components/InstanceTypesMenu/components/CustomMenu';
import { InstanceTypeCategory, InstanceTypeSize } from './utils/types';

import './SelectInstanceTypeSection.scss';

const SelectInstanceTypeSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<InstanceTypeCategory>(null);
  const [selectedSize, setSelectedSize] = useState<InstanceTypeSize>(null);

  const handleSelect = (category: InstanceTypeCategory, instanceType: InstanceTypeSize) => {
    setSelectedCategory(category);
    setSelectedSize(instanceType);
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
              selectedCategory: selectedCategory,
              selectedSize: selectedSize,
            }}
          />
        </GridItem>
      ))}
    </Grid>
  );
};

export default SelectInstanceTypeSection;
