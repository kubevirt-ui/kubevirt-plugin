import React, { FC, ReactNode, useState } from 'react';

import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';

import './PopoverSectionExpandable.scss';

type PopoverSectionExpandableProps = {
  children: ReactNode;
  toggleText: string;
};

const PopoverSectionExpandable: FC<PopoverSectionExpandableProps> = ({ children, toggleText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        className="popover-section-expandable__toggle"
        onClick={() => setIsExpanded((prev) => !prev)}
        type="button"
      >
        {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
        <strong>{toggleText}</strong>
      </button>
      {isExpanded && children}
    </div>
  );
};

export default PopoverSectionExpandable;
