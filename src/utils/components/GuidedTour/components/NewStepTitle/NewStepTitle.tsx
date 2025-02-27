import React, { FC } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';

type NewStepTitleProps = { title: string };

const NewStepTitle: FC<NewStepTitleProps> = ({ title }) => {
  return (
    <span>
      {title} <NewBadge />
    </span>
  );
};

export default NewStepTitle;
