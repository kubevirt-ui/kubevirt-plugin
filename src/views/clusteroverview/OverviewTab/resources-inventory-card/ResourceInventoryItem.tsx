import React from 'react';
import { Link } from 'react-router-dom';

import './ResourcesInventoryCard.scss';

type ResourceInventoryItemProps = {
  quantity: number;
  label: string;
  path: string;
};

const ResourceInventoryItem: React.FC<ResourceInventoryItemProps> = ({ quantity, label, path }) => (
  <div className="resources-inventory-card__resource">
    <Link to={path}>
      <div className="resources-inventory-card__quantity">{quantity}</div>
    </Link>
    <div className="resources-inventory-card__quantity-label">{label}</div>
  </div>
);

export default ResourceInventoryItem;
