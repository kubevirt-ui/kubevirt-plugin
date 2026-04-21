import React, { FC } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { SelectOption } from '@patternfly/react-core';

import { getSubscriptionItem, selectItems } from './utils/utils';

import './automatic-subscription-type.scss';

type AutomaticSubscriptionTypeProps = {
  selected: { title: string; value: string };
  setSelected: (selected: { title: string; value: string }) => void;
  updateSubscriptionType: (obj: { type: string }) => void;
};

const AutomaticSubscriptionType: FC<AutomaticSubscriptionTypeProps> = ({
  selected = selectItems[0],
  setSelected,
  updateSubscriptionType,
}) => {
  return (
    <div className="AutomaticSubscriptionType--main">
      <FormPFSelect
        onSelect={(_e, value: string) => {
          setSelected(getSubscriptionItem(value));
          updateSubscriptionType({ type: value });
        }}
        selected={selected.value}
        selectedLabel={selected.title}
        toggleProps={{ id: 'subscription-type-dropdown' }}
      >
        {selectItems.map((item) => (
          <SelectOption key={item.value} value={item.value}>
            {item.title}
          </SelectOption>
        ))}
      </FormPFSelect>
    </div>
  );
};

export default AutomaticSubscriptionType;
