import React, { FormEvent, MouseEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';

import useEventListener from '@kubevirt-utils/hooks/useEventListener';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Menu, MenuContent, MenuItem, MenuList, Popper, SearchInput } from '@patternfly/react-core';

import { SearchItem, searchItems } from '../utils/search';

import { createConfigurationSearchURL } from './utils/utils';

import './virtual-machine-configuration-tab-search.scss';

const VirtualMachineConfigurationTabSearch = () => {
  const [value, setValue] = useState<string>('');
  const history = useHistory();
  const [autocompleteOptions, setAutocompleteOptions] =
    useState<{ element: SearchItem; tab: string }[]>(searchItems);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState<boolean>(false);
  useEventListener('click', () => setIsAutocompleteOpen(false));

  const onClear = () => {
    setValue('');
  };

  const onChange = (_e: FormEvent<HTMLInputElement>, newValue: string) => {
    setIsAutocompleteOpen(true);
    setValue(newValue);
    const isEmptyValue = isEmpty(newValue);
    const options =
      !isEmptyValue &&
      searchItems.reduce(
        (acc, item) => {
          const title = item.element.title.toLowerCase();
          const match = newValue.toLowerCase();
          if (title.startsWith(match)) {
            acc.startWith.push(item);
            return acc;
          }

          if (title.includes(match)) acc.includes.push(item);

          return acc;
        },
        { includes: [], startWith: [] },
      );
    const autoCompleteOptions =
      options && [...options.startWith, ...options.includes].flat().slice(0, 9);
    setAutocompleteOptions(isEmptyValue ? searchItems : autoCompleteOptions);
  };

  const onSelect = (e: MouseEvent<Element, globalThis.MouseEvent>, itemId: string) => {
    e.stopPropagation();
    setValue(itemId);
    setIsAutocompleteOpen(false);
  };

  return (
    <Popper
      popper={
        <Menu isScrollable onSelect={onSelect}>
          <MenuContent>
            <MenuList>
              {autocompleteOptions.map(({ element, tab }) => (
                <MenuItem
                  onClick={() =>
                    history.push(
                      createConfigurationSearchURL(tab, element?.id, history?.location?.pathname),
                    )
                  }
                  description={element?.description}
                  itemId={element?.title}
                  key={element?.id}
                >
                  {element?.title}
                </MenuItem>
              ))}
            </MenuList>
          </MenuContent>
        </Menu>
      }
      trigger={
        <SearchInput
          className="VirtualMachineConfigurationTanSearch--main"
          id="VirtualMachineConfigurationTanSearch-autocomplete-search"
          onChange={onChange}
          onClear={onClear}
          value={value}
        />
      }
      isVisible={isAutocompleteOpen}
    />
  );
};

export default VirtualMachineConfigurationTabSearch;
