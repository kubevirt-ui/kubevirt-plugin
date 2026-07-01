import React, { FC, FormEvent, MouseEvent, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
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

import { SearchItemWithTab } from '../../../views/virtualmachines/details/tabs/configuration/utils/search';

import { getOptions } from './utils/configurationSearch';

import './configuration-search.scss';

type ConfigurationSearchProps = {
  createSearchURL: (tab: string, elementId: string, pathname: string) => string;
  placeholder?: string;
  searchItems: SearchItemWithTab[];
};

const ConfigurationSearch: FC<ConfigurationSearchProps> = ({
  createSearchURL,
  placeholder,
  searchItems,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [value, setValue] = useState<string>('');
  const [isPopperVisible, setIsPopperVisible] = useState(false);
  const [searchResultOptions, setSearchResultOptions] = useState(searchItems);

  const onClear = useCallback(() => setValue(''), []);

  const onChange = useCallback(
    (_e: FormEvent<HTMLInputElement>, newValue: string) => {
      setIsPopperVisible(true);
      setValue(newValue);
      const options = getOptions(searchItems, newValue);
      setSearchResultOptions(options);
    },
    [searchItems],
  );

  const onSelect = useCallback((e: MouseEvent<Element, globalThis.MouseEvent>, itemId: string) => {
    e.stopPropagation();
    setValue(itemId);
    setIsPopperVisible(false);
  }, []);

  const preventBlur = useCallback((e: MouseEvent) => e.preventDefault(), []);

  return (
    <Popper
      popper={
        <Menu isScrollable onMouseDown={preventBlur} onSelect={onSelect}>
          <MenuContent>
            <MenuList>
              {searchResultOptions.map(({ element, tab }) => (
                <MenuItem
                  description={element?.description}
                  itemId={element?.title}
                  key={element?.id}
                  onClick={() => navigate(createSearchURL(tab, element?.id, location?.pathname))}
                >
                  {element?.title}
                </MenuItem>
              ))}
              {isEmpty(searchResultOptions) && (
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
          onBlur={() => setIsPopperVisible(false)}
          onChange={onChange}
          onClear={onClear}
          placeholder={placeholder ?? t('Find settings')}
          value={value}
        />
      }
      isVisible={isPopperVisible}
    />
  );
};

export default ConfigurationSearch;
