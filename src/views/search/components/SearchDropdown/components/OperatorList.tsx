import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, MenuList } from '@patternfly/react-core';

import { OPERATOR_OPTIONS } from '../constants';

import SearchMenuItem from './SearchMenuItem';

type OperatorListProps = {
  focusedItemIndex: number;
  onSelectOperator: (operator: string) => void;
  searchKey: string;
};

const OperatorList: FC<OperatorListProps> = ({ focusedItemIndex, onSelectOperator, searchKey }) => {
  const { t } = useKubevirtTranslation();

  return (
    <MenuList aria-label={t('Operators for {{key}}', { key: searchKey })}>
      {OPERATOR_OPTIONS.map(({ label, value }, index) => (
        <SearchMenuItem
          data-test={`search-operator-${value}`}
          isFocused={index === focusedItemIndex}
          itemId={value}
          key={value}
          onClick={() => onSelectOperator(value)}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <span className="pf-v6-u-font-size-lg">{value}</span>
            <span className="pf-v6-u-text-color-subtle">{label}</span>
          </Flex>
        </SearchMenuItem>
      ))}
    </MenuList>
  );
};

export default OperatorList;
