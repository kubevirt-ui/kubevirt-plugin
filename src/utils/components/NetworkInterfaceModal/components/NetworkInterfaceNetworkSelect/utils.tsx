import React from 'react';
import { TFunction } from 'react-i18next';

import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { parseDNS1123Label } from '@kubevirt-utils/utils/validation';
import { HelperText, HelperTextItem, Label, SelectOptionProps } from '@patternfly/react-core';
import { InfoIcon } from '@patternfly/react-icons';

export const createNewNetworkOption = (value) => ({
  optionProps: {
    children: (
      <>
        {value}
        <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
      </>
    ),
  },
  type: interfaceTypesProxy.bridge,
  value,
});

export const getCreateNetworkOption = (input: string, t: TFunction): SelectOptionProps => {
  if (!input || input.split('/').length !== 2 || input.split('/').some((part) => !part)) {
    return {
      children: (
        <HelperText>
          <HelperTextItem icon={<InfoIcon />} variant="indeterminate">
            {t('Type namespace/network-name to use a different network')}
          </HelperTextItem>
        </HelperText>
      ),
      isDisabled: true,
    };
  }

  const { getErrorMsg } =
    // both namespace and NAD name are DNS labels
    input
      .split('/')
      .map((part) => parseDNS1123Label(part))
      .find(({ isValid }) => !isValid) ?? {};
  if (getErrorMsg) {
    return {
      children: (
        <HelperText>
          <HelperTextItem variant="error">{getErrorMsg(t)}</HelperTextItem>
        </HelperText>
      ),
      isDisabled: true,
    };
  }

  return {
    children: (
      <>
        {t('Use "{{inputValue}}"', { inputValue: input })}{' '}
        <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
      </>
    ),
  };
};
