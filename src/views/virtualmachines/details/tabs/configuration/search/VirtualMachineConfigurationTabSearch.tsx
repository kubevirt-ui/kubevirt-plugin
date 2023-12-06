import React, { FormEvent, MouseEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';

import useEventListener from '@kubevirt-utils/hooks/useEventListener';
import { Menu, MenuContent, MenuItem, MenuList, Popper, SearchInput } from '@patternfly/react-core';

import './virtual-machine-configuration-tab-search.scss';

const VirtualMachineConfigurationTabSearch = () => {
  const [value, setValue] = useState<string>('');
  const history = useHistory();
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState<boolean>(false);
  useEventListener('click', () => setIsAutocompleteOpen(false));

  const onClear = () => {
    setValue('');
  };

  const onChange = (_e: FormEvent<HTMLInputElement>, newValue: string) => {
    setIsAutocompleteOpen(true);
    setValue(newValue);
    setAutocompleteOptions(['matan']);
  };

  const onSelect = (e: MouseEvent<Element, globalThis.MouseEvent>, itemId: string) => {
    e.stopPropagation();
    setValue(itemId);
    setIsAutocompleteOpen(false);
  };

  return (
    <Popper
      popper={
        <Menu onSelect={onSelect}>
          <MenuContent>
            <MenuList>
              {autocompleteOptions.map((val) => (
                <MenuItem
                  itemId={val}
                  key={val}
                  onClick={() => history.push('details#guest-system-log-access')}
                >
                  {val}
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
