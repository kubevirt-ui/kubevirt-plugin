import React, { FC } from 'react';

type ResourceTitleProps = {
  name?: string;
  title: string;
};

const ResourceTitle: FC<ResourceTitleProps> = ({ name, title }) => {
  return (
    <div className="pf-v6-u-mb-xs">
      <span className="pf-v6-c-card__title-text">{title}</span>
      {name && <span className="pf-v6-u-ml-sm">{name}</span>}
    </div>
  );
};

export default ResourceTitle;
