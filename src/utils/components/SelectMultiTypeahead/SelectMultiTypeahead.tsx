// IMPORTANT NOTE
// This code is 1:1 copy from PatternFly enhanced with an ability to set the initial value of the inputValue state
// TODO: Once this PR https://github.com/patternfly/patternfly-react/pull/11791 gets merged and released,
// this component can be replaced with the PatternFly MultiTypeaheadSelect from '@patternfly/react-templates'

import React, {
  CSSProperties,
  FC,
  FormEvent,
  forwardRef,
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@patternfly/react-core/dist/esm/components/Button';
import { Label, LabelGroup } from '@patternfly/react-core/dist/esm/components/Label';
import {
  MenuToggle,
  MenuToggleElement,
  MenuToggleProps,
} from '@patternfly/react-core/dist/esm/components/MenuToggle';
import {
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  SelectProps,
} from '@patternfly/react-core/dist/esm/components/Select';
import {
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core/dist/esm/components/TextInputGroup';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

export interface MultiTypeaheadSelectOption extends Omit<SelectOptionProps, 'content'> {
  /** Content of the select option. */
  content: number | string;
  /** Value of the select option. */
  value: number | string;
}

export interface MultiTypeaheadSelectProps
  extends Omit<SelectProps, 'onSelect' | 'onToggle' | 'toggle'> {
  /** Initial value of the typeahead text input. */
  initialInputValue?: string;
  /** Initial options of the select. */
  initialOptions: MultiTypeaheadSelectOption[];
  /** @hide Forwarded ref */
  innerRef?: Ref<any>;
  /** Flag indicating the select should be disabled. */
  isDisabled?: boolean;
  /** Message to display when no options match the filter. */
  noOptionsFoundMessage?: ((filter: string) => string) | string;
  /** Callback triggered when the text in the input field changes. */
  onInputChange?: (newValue: string) => void;
  /** Custom callback triggered when the input field has focus and a keyboard event is triggered.
   * This will override the default keydown behavior for the input field.
   */
  onInputKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Callback triggered on selection. */
  onSelectionChange?: (
    _event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<Element, MouseEvent>,
    selections: (number | string)[],
  ) => void;
  /** Callback triggered when the select opens or closes. */
  onToggle?: (nextIsOpen: boolean) => void;
  /** Placeholder text for the select input. */
  placeholder?: string;
  /** Additional props passed to the toggle. */
  toggleProps?: MenuToggleProps;
  /** Width of the toggle. */
  toggleWidth?: string;
}

export const MultiTypeaheadSelectBase: FC<MultiTypeaheadSelectProps> = ({
  initialInputValue,
  initialOptions,
  innerRef,
  isDisabled,
  noOptionsFoundMessage = (filter) => `No results found for "${filter}"`,
  onInputChange,
  onInputKeyDown: onInputKeyDownProp,
  onSelectionChange,
  onToggle,
  placeholder = 'Select an option',
  toggleProps,
  toggleWidth,
  ...props
}: MultiTypeaheadSelectProps) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<(number | string)[]>(
    (initialOptions?.filter((o) => o.selected) ?? []).map((o) => o.value),
  );
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [selectOptions, setSelectOptions] = useState<MultiTypeaheadSelectOption[]>(initialOptions);
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItemId, setActiveItemId] = useState<null | string>(null);
  const textInputRef = useRef<HTMLInputElement>(undefined);

  const NO_RESULTS = 'no results';

  const openMenu = () => {
    onToggle && onToggle(true);
    setOpen(true);
  };

  useEffect(() => {
    let newSelectOptions: MultiTypeaheadSelectOption[] = initialOptions;

    // Filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = initialOptions.filter((option) =>
        String(option.content).toLowerCase().includes(inputValue.toLowerCase()),
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            content:
              typeof noOptionsFoundMessage === 'string'
                ? noOptionsFoundMessage
                : noOptionsFoundMessage(inputValue),
            isAriaDisabled: true,
            value: NO_RESULTS,
          },
        ];
      }
    }

    setSelectOptions(newSelectOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, initialOptions]);

  useEffect(
    () => setSelectedValues((initialOptions?.filter((o) => o.selected) ?? []).map((o) => o.value)),
    [initialOptions],
  );

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(focusedItem.value as string);
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    onToggle && onToggle(false);
    setOpen(false);
    resetActiveAndFocusedItem();
  };

  const onInputClick = () => {
    if (!open) {
      openMenu();
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const selectOption = (
    _event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<Element, MouseEvent>
      | undefined,
    option: number | string,
  ) => {
    const selections = selectedValues.includes(option)
      ? selectedValues.filter((o) => option !== o)
      : [...selectedValues, option];

    onSelectionChange && onSelectionChange(_event, selections);
    setSelectedValues(selections);
  };

  const clearOption = (
    _event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<Element, MouseEvent>
      | undefined,
    option: number | string,
  ) => {
    const selections = selectedValues.filter((o) => option !== o);
    onSelectionChange && onSelectionChange(_event, selections);
    setSelectedValues(selections);
  };

  const _onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: number | string | undefined,
  ) => {
    if (value && value !== NO_RESULTS) {
      selectOption(_event, value);
    }
  };

  const onTextInputChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    onInputChange && onInputChange(value);

    if (value && !open) {
      openMenu();
    }

    resetActiveAndFocusedItem();
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!open) {
      openMenu();
    }

    if (selectOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectOptions.length - 1;
        }
      }
    }

    if (key === 'ArrowDown') {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const defaultOnInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (
          open &&
          focusedItem &&
          focusedItem.value !== NO_RESULTS &&
          !focusedItem.isAriaDisabled
        ) {
          selectOption(event, focusedItem?.value);
        }

        if (!open) {
          onToggle && onToggle(true);
          setOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onInputKeyDownProp) {
      onInputKeyDownProp(event);
    } else {
      defaultOnInputKeyDown(event);
    }
  };

  const onToggleClick = () => {
    onToggle && onToggle(!open);
    setOpen(!open);
    textInputRef?.current?.focus();
  };

  const onClearButtonClick = (ev: React.MouseEvent) => {
    setSelectedValues([]);
    onInputChange && onInputChange('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
    onSelectionChange && onSelectionChange(ev, []);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      style={
        {
          width: toggleWidth,
        } as CSSProperties
      }
      aria-label="Multi select Typeahead menu toggle"
      isDisabled={isDisabled}
      isExpanded={open}
      isFullWidth
      onClick={onToggleClick}
      ref={toggleRef}
      variant="typeahead"
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          autoComplete="off"
          innerRef={textInputRef}
          onChange={onTextInputChange}
          onClick={onInputClick}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          value={inputValue}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          aria-controls="select-typeahead-listbox"
          isExpanded={open}
          role="combobox"
        >
          <LabelGroup aria-label="Current selections">
            {selectedValues.map((selection, index) => (
              <Label
                onClick={(ev) => {
                  ev.stopPropagation();
                  clearOption(ev, selection);
                }}
                datatest-id={`${selection}-chip`}
                key={index}
              >
                {initialOptions.find((o) => o.value === selection)?.content}
              </Label>
            ))}
          </LabelGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities
          {...(selectedValues.length === 0 ? { style: { display: 'none' } } : {})}
        >
          <Button aria-label="Clear input value" onClick={onClearButtonClick} variant="plain">
            <TimesIcon />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      onOpenChange={(isOpen) => {
        !isOpen && closeMenu();
      }}
      isOpen={open}
      onSelect={_onSelect}
      ref={innerRef}
      selected={selectedValues}
      toggle={toggle}
      variant="typeahead"
      {...props}
    >
      <SelectList>
        {selectOptions.map((option, index) => {
          const { content, value, ...otherProps } = option;

          return (
            <SelectOption
              isFocused={focusedItemIndex === index}
              key={value}
              value={value}
              {...otherProps}
            >
              {content}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

export const MultiTypeaheadSelect = forwardRef(
  (props: MultiTypeaheadSelectProps, ref: Ref<any>) => (
    <MultiTypeaheadSelectBase {...props} innerRef={ref} />
  ),
);
