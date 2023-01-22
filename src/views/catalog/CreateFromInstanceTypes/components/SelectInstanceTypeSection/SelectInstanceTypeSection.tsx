import React from 'react';

import { InstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { Grid, GridItem } from '@patternfly/react-core';

import CategoryCard from './components/category-card/components/CategoryCard/CategoryCard';
import CustomMenu from './components/category-card/components/InstanceTypesMenu/components/CustomMenu';
import { InstanceTypeCategory, InstanceTypeSize } from './utils/types';
import { seriesDetails } from './utils/utils';

import './SelectInstanceTypeSection.scss';

type SelectInstanceTypeSectionProps = {
  selectedInstanceType: InstanceTypeState;
  setSelectedInstanceType: React.Dispatch<React.SetStateAction<InstanceTypeState>>;
};

const SelectInstanceTypeSection: React.FC<SelectInstanceTypeSectionProps> = ({
  selectedInstanceType,
  setSelectedInstanceType,
}) => {
  const handleSelect = (category: InstanceTypeCategory, size: InstanceTypeSize) => {
    setSelectedInstanceType({ category, size, name: `${seriesDetails[category].prefix}.${size}` });
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
