import React, { FC, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { dropDownItems } from './utils/utils';

import './automatic-subscription-type.scss';

type AutomaticSubscriptionTypeProps = {
  selected: { title: string; value: string };
  setSelected: (selected: { title: string; value: string }) => void;
  updateSubscriptionType: (obj: { type: string }) => void;
};

const AutomaticSubscriptionType: FC<AutomaticSubscriptionTypeProps> = ({
  selected = dropDownItems[0],
  setSelected,
  updateSubscriptionType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="AutomaticSubscriptionType--main">
      <Dropdown
        onSelect={(_e, value: string) => {
          setSelected(dropDownItems.find((item) => item.value === value));
          updateSubscriptionType({ type: value });
          setIsOpen(false);
        }}
        toggle={DropdownToggle({
          children: <>{selected.title}</>,
          className: 'AutomaticSubscriptionType--toggle',
          id: 'toggle-auto-register-rhel',
          onClick: () => setIsOpen((prevIsOpen) => !prevIsOpen),
        })}
        isOpen={isOpen}
        selected={selected.value}
      >
        <DropdownList>
          {dropDownItems.map((item) => (
            <DropdownItem key={item.value} value={item.value}>
              {item.title}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </div>
  );
};

export default AutomaticSubscriptionType;
