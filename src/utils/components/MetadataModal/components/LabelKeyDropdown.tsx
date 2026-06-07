import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CREATE_VALUE, HINT_VALUE, NO_RESULTS_VALUE } from '../utils/constants';
import { GroupedOptions } from '../utils/types';
import { createLabelKeyId } from '../utils/utils';

type LabelKeyDropdownProps = {
  activeItemId: null | string;
  canCreateNew: boolean;
  groups: GroupedOptions;
  hasResults: boolean;
  inputValue: string;
  listboxId: string;
};

const LabelKeyDropdown: FC<LabelKeyDropdownProps> = ({
  activeItemId,
  canCreateNew,
  groups,
  hasResults,
  inputValue,
  listboxId,
}) => {
  const { t } = useKubevirtTranslation();
  const createNewId = createLabelKeyId(CREATE_VALUE);

  return (
    <SelectList id={listboxId}>
      <SelectOption
        className="label-key-select-hint"
        icon={<InfoCircleIcon />}
        isDisabled
        value={HINT_VALUE}
      >
        {t('Type a name to create a new key')}
      </SelectOption>
      {canCreateNew && (
        <SelectOption
          id={createNewId}
          isFocused={activeItemId === createNewId}
          value={CREATE_VALUE}
        >
          {t('Create "{{key}}"', { key: inputValue })}
        </SelectOption>
      )}
      {groups.map(({ label, options }) => (
        <SelectGroup className="label-key-select-group" key={label} label={label}>
          {options.map((key) => (
            <SelectOption
              id={createLabelKeyId(key)}
              isFocused={activeItemId === createLabelKeyId(key)}
              key={key}
              value={key}
            >
              {key}
            </SelectOption>
          ))}
        </SelectGroup>
      ))}
      {!hasResults && (
        <SelectOption isDisabled value={NO_RESULTS_VALUE}>
          {t('No results found')}
        </SelectOption>
      )}
    </SelectList>
  );
};

export default LabelKeyDropdown;
