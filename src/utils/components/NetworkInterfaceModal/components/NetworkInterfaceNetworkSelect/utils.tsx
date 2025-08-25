import React from 'react';

import { INVALID } from '@kubevirt-utils/components/SelectTypeahead/utils/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, SelectOptionProps } from '@patternfly/react-core';

export const getCreateNetworkOption = (inputValue: string): SelectOptionProps => {
  const filterIsEmpty = isEmpty(inputValue);

  return {
    children: filterIsEmpty ? (
      t('Type namespace/network-name')
    ) : (
      <>
        {t(`Use "{{inputValue}}"`, { inputValue })}{' '}
        <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
      </>
    ),
    isDisabled: filterIsEmpty,
    value: filterIsEmpty ? INVALID : inputValue,
  };
};
