import { type FormEvent, type KeyboardEvent, type MouseEvent, type MutableRefObject } from 'react';
import { type TFunction } from 'i18next';

import { type MenuToggleProps, type SelectOptionProps } from '@patternfly/react-core';

export type SelectTypeaheadOptionProps = {
  label?: string;
  optionProps?: SelectOptionProps;
  value: string;
};

export type SelectTypeaheadProps = {
  addOption?: (value: string) => boolean | string;
  canCreate?: boolean;
  dataTestId?: string;
  getCreateAction?: (value: string, t: TFunction) => SelectOptionProps;
  getToggleStatus?: (value: string) => MenuToggleProps['status'];
  isDisabled?: boolean;
  isFullWidth?: boolean;
  options: SelectTypeaheadOptionProps[];
  placeholder?: string;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
};

export type UseSelectTypeaheadProps = Pick<
  SelectTypeaheadProps,
  'addOption' | 'canCreate' | 'getCreateAction' | 'options' | 'selectedValue' | 'setSelectedValue'
>;

export type UseSelectTypeaheadResult = {
  activeItemId: null | string;
  focusedItemIndex: null | number;
  inputValue: string;
  isOpen: boolean;
  listboxId: string;
  onClearButtonClick: () => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (_event: MouseEvent | undefined, value: number | string | undefined) => void;
  onTextInputChange: (_event: FormEvent<HTMLInputElement>, value: string) => void;
  onToggleClick: () => void;
  openMenu: () => void;
  selectOptions: SelectTypeaheadOptionProps[];
  textInputRef: MutableRefObject<HTMLInputElement | undefined>;
};
