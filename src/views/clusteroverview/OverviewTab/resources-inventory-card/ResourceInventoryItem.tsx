import React, { FC } from 'react';
import { Link } from 'react-router';

import './ResourcesInventoryCard.scss';

type ResourceInventoryItemProps = {
  label: string;
  path: string;
  quantity: number;
};

const ResourceInventoryItem: FC<ResourceInventoryItemProps> = ({ label, path, quantity }) => (
  <div className="resources-inventory-card__resource">
    <Link to={path}>
      <div className="resources-inventory-card__quantity">{quantity}</div>
    </Link>
    <div className="resources-inventory-card__quantity-label">{label}</div>
  </div>
);

export default ResourceInventoryItem;
