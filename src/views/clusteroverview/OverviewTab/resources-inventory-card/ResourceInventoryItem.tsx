import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import './ResourcesInventoryCard.scss';

type ResourceInventoryItemProps = {
  label: string;
  path: string;
  quantity: number;
};

const ResourceInventoryItem: React.FC<ResourceInventoryItemProps> = ({ label, path, quantity }) => (
  <div className="resources-inventory-card__resource">
    <Link to={path}>
      <div className="resources-inventory-card__quantity">{quantity}</div>
    </Link>
    <div className="resources-inventory-card__quantity-label">{label}</div>
  </div>
);

export default ResourceInventoryItem;
