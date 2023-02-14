import React from 'react';
import classNames from 'classnames';

import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { AngleDownIcon } from '@patternfly/react-icons';

import { CategoryCustomData } from '../../../../utils/types';
import { categoryDetailsMap, getInstancetype } from '../../../../utils/utils';

import './CategoryCard.scss';

type CategoryCardProps = {
  toggleRef?: React.Ref<HTMLDivElement>;
  isExpanded?: boolean;
  onClick: () => void;
  customData: CategoryCustomData;
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  toggleRef,
  isExpanded,
  onClick,
  customData,
}) => {
  const { category, selectedCategory, selectedSize } = customData;
  const details = categoryDetailsMap[category];
  const { Icon, instanceTypes, seriesLabel, title } = details;

  const isSelectedCategory = selectedCategory === category;
  const displaySelection = isSelectedCategory && Boolean(selectedSize);
  const selectedInstanceTypeDetails = getInstancetype(selectedSize, instanceTypes);

  return (
    <div
      ref={toggleRef}
      className={classNames('category-card', { 'selected-category': isSelectedCategory })}
      onClick={onClick}
      {...(isExpanded && { 'aria-expanded': true })}
    >
      {Icon && (
        <div className="category-card__icon">
          <Icon />
        </div>
      )}
      <div className="category-card__name">{title && title}</div>
      <div className="category-card__series-label">
        {seriesLabel} <AngleDownIcon className="category-card__series-label-icon" />
      </div>
      {displaySelection && (
        <div className="category-card__size-label">
          <div>{`${selectedInstanceTypeDetails?.label}:`}</div>
          <div>{`${selectedInstanceTypeDetails?.cores} Cores, ${readableSizeUnit(
            selectedInstanceTypeDetails?.memory,
          )} Memory`}</div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
