import { type TFunction } from 'i18next';

import { type SelectOptionProps } from '@patternfly/react-core';

import { type SelectTypeaheadOptionProps } from './types';
import { getDisplayValue } from './utils';

type BuildOptionsParams = {
  canCreate: boolean;
  createActionId: string;
  getCreateAction?: (value: string, t: TFunction) => SelectOptionProps;
  inputValue: string;
  invalidActionId: string;
  options: SelectTypeaheadOptionProps[];
  selected: SelectTypeaheadOptionProps | undefined;
  t: TFunction;
};

export const buildSelectOptions = ({
  canCreate,
  createActionId,
  getCreateAction,
  inputValue,
  invalidActionId,
  options,
  selected,
  t,
}: BuildOptionsParams): SelectTypeaheadOptionProps[] => {
  const showAllOptions = !inputValue || inputValue === getDisplayValue(selected);
  const filteredOptions = options?.filter(
    (opt) =>
      showAllOptions || getDisplayValue(opt).toLowerCase().includes(inputValue.toLowerCase()),
  );
  const isNameConflict = options.some(
    (opt) => getDisplayValue(opt) === inputValue || opt.value === inputValue,
  );

  const createOption: SelectTypeaheadOptionProps = canCreate && {
    optionProps: getCreateAction?.(isNameConflict ? '' : inputValue, t),
    value: createActionId,
  };
  const notFoundOption: SelectTypeaheadOptionProps = !canCreate &&
    filteredOptions.length === 0 &&
    inputValue && {
      label: t('No results found for "{{value}}"', { value: inputValue }),
      optionProps: { isDisabled: true },
      value: invalidActionId,
    };
  const notAvailableOption: SelectTypeaheadOptionProps = !canCreate &&
    options.length === 0 &&
    !inputValue && {
      label: t('No options are available'),
      optionProps: { isDisabled: true },
      value: invalidActionId,
    };

  return [notAvailableOption || notFoundOption || createOption, ...filteredOptions].filter(Boolean);
};
