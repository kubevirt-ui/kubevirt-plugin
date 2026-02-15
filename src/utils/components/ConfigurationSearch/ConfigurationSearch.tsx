import React, { FC, FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useLocation } from 'react-router-dom-v5-compat';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import useEventListener from '@kubevirt-utils/hooks/useEventListener';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Bullseye,
  Icon,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Popper,
  SearchInput,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import {
  SearchItem,
  SearchItemWithTab,
} from '../../../views/virtualmachines/details/tabs/configuration/utils/search';

import './configuration-search.scss';

type ConfigurationSearchProps = {
  createSearchURL: (tab: string, elementId: string, pathname: string) => string;
  searchItems: SearchItemWithTab[];
};

const ConfigurationSearch: FC<ConfigurationSearchProps> = ({ createSearchURL, searchItems }) => {
  const { t } = useKubevirtTranslation();
  const [value, setValue] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const [autocompleteOptions, setAutocompleteOptions] =
    useState<{ element: SearchItem; tab: string }[]>(searchItems);

  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState<boolean>(false);
  useEventListener('click', () => setIsAutocompleteOpen(false));

  const onClear = () => {
    setValue('');
  };

  // Every click on item set and render as its pushing new url - this is for keeping the select item in search bar
  useEffect(() => {
    const hash = location?.hash;
    const item = searchItems?.find(({ element }) => element?.id === hash.substring(1));
    setValue(item?.element?.title || '');
  }, [location.hash, searchItems]);

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

          if (item.element.isDisabled) return acc;

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

  useEffect(() => {
    setAutocompleteOptions(searchItems);
  }, [searchItems]);

  return (
    <Popper
      popper={
        <Menu isScrollable onSelect={onSelect}>
          <MenuContent>
            <MenuList>
              {autocompleteOptions.map(({ element, tab }) => (
                <MenuItem
                  description={element?.description}
                  itemId={element?.title}
                  key={element?.id}
                  onClick={() => navigate(createSearchURL(tab, element?.id, location?.pathname))}
                >
                  {element?.title}
                </MenuItem>
              ))}
              {isEmpty(autocompleteOptions) && (
                <Bullseye className="ConfigurationSearch--main__no-results">
                  <Icon color="grey" size="xl">
                    <SearchIcon />
                  </Icon>
                  <Title headingLevel="h5">
                    <MutedTextSpan text={t('No configurable settings found')} />
                  </Title>
                </Bullseye>
              )}
            </MenuList>
          </MenuContent>
        </Menu>
      }
      trigger={
        <SearchInput
          className="ConfigurationSearch--main"
          id="ConfigurationSearch-autocomplete-search"
          onChange={onChange}
          onClear={onClear}
          value={value}
        />
      }
      isVisible={isAutocompleteOpen}
    />
  );
};

export default ConfigurationSearch;
