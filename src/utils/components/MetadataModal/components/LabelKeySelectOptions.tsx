import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SelectGroup, SelectOption } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

const createItemId = (value: string) => `label-key-select-${String(value).replace(/ /g, '-')}`;

type GroupedOption = { label: string; options: string[] };

type LabelKeySelectOptionsProps = {
  activeItemId: null | string;
  canCreateNew: boolean;
  groups: GroupedOption[];
  hasResults: boolean;
  inputValue: string;
};

const LabelKeySelectOptions: FC<LabelKeySelectOptionsProps> = ({
  activeItemId,
  canCreateNew,
  groups,
  hasResults,
  inputValue,
}) => {
  const { t } = useKubevirtTranslation();
  const createNewLabel = t('Create "{{key}}"', { key: inputValue });

  return (
    <>
      <SelectOption
        className="label-key-select-hint"
        icon={<InfoCircleIcon />}
        isDisabled
        value="__hint__"
      >
        {t('Type a name to create a new key')}
      </SelectOption>

      {canCreateNew && (
        <SelectOption
          id={createItemId('__create__')}
          isFocused={activeItemId === createItemId('__create__')}
          value="__create__"
        >
          {createNewLabel}
        </SelectOption>
      )}

      {groups.map(({ label, options }) => (
        <SelectGroup className="label-key-select-group" key={label} label={label}>
          {options.map((key) => (
            <SelectOption
              id={createItemId(key)}
              isFocused={activeItemId === createItemId(key)}
              key={key}
              value={key}
            >
              {key}
            </SelectOption>
          ))}
        </SelectGroup>
      ))}

      {!hasResults && (
        <SelectOption isDisabled value="__no_results__">
          {t('No results found')}
        </SelectOption>
      )}
    </>
  );
};

export default LabelKeySelectOptions;
