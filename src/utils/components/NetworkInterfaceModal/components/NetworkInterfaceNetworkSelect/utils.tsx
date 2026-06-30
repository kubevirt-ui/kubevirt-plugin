import React, { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { GLOBAL_NAD_NAMESPACES } from '@kubevirt-utils/constants/constants';
import { NAD_TYPE_OVN_K8S_CNI_OVERLAY } from '@kubevirt-utils/resources/vm';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getDNS1123LabelError } from '@kubevirt-utils/utils/validation';
import { HelperText, HelperTextItem, Label, type SelectOptionProps } from '@patternfly/react-core';
import { InfoIcon } from '@patternfly/react-icons';

import { getNadFullName, getNameAndNs, isNadFullName, isOvnOverlayNad } from '../../utils/helpers';
import { type NetworkAttachmentDefinition } from '../hooks/types';
import InvalidNADNamespace from './components/InvalidNADNamespace';
import { type NetworkSelectTypeaheadOptionProps } from './types';

export const createNewNetworkOption = (
  value: string,
  t: TFunction,
): NetworkSelectTypeaheadOptionProps => ({
  optionProps: {
    children: (
      <>
        {value}
        <Label isCompact>
          {interfaceTypesProxy.bridge} {t('Binding')}
        </Label>
      </>
    ),
  },
  type: interfaceTypesProxy.bridge,
  value,
});

export const getCreateNetworkOption =
  (validators: ((name: string) => ReactNode)[]) =>
  (input: string, t: TFunction): SelectOptionProps => {
    if (input?.split('/').length !== 2 || input.split('/').some((part) => !part)) {
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

    const getErrorMsg =
      // both namespace and NAD name are DNS labels
      input
        .split('/')
        .map((part) => getDNS1123LabelError(part))
        .find((getMsg) => getMsg);

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

    const [firstError] = validators.map((getMore) => getMore(input)).filter(Boolean);
    if (firstError) {
      return {
        children: (
          <HelperText>
            <HelperTextItem variant="error">{firstError}</HelperTextItem>
          </HelperText>
        ),
        isDisabled: true,
      };
    }

    return {
      children: (
        <>
          {t('Use "{{inputValue}}"', { inputValue: input })}{' '}
          <Label isCompact>
            {interfaceTypesProxy.bridge} {t('Binding')}
          </Label>
        </>
      ),
    };
  };

export const buildValidators = ({
  currentlyUsedNADFullNames,
  nads,
  primaryNADs,
  t,
  vmiNamespace,
}: {
  currentlyUsedNADFullNames: string[];
  nads: NetworkAttachmentDefinition[];
  primaryNADs: NetworkAttachmentDefinition[];
  t: TFunction;
  vmiNamespace: string;
}): ((fullName: string) => ReactNode)[] => {
  const ovnNADFullNames =
    nads?.filter(isOvnOverlayNad).map((nad) => getNadFullName(getNameAndNs(nad))) ?? [];

  return [
    (fullName): ReactNode =>
      primaryNADs.map((nad) => getNadFullName(getNameAndNs(nad))).includes(fullName) &&
      t('Primary user-defined network cannot be used as a secondary network.'),
    (fullName): ReactNode =>
      currentlyUsedNADFullNames.includes(fullName) &&
      ovnNADFullNames.includes(fullName) &&
      t('NetworkAttachmentDefinition of type [{{type}}] can be only used once.', {
        type: NAD_TYPE_OVN_K8S_CNI_OVERLAY,
      }),
    (fullName): ReactNode => validateNADNamespace(fullName, vmiNamespace),
  ];
};

// eslint-disable-next-line
export const validateNADNamespace = (name: string, vmNamespace: string): false | ReactNode => {
  if (!isNadFullName(name)) {
    return false;
  }
  const allowedNamespaces = Array.from(new Set([vmNamespace, ...GLOBAL_NAD_NAMESPACES]));
  const [nadNamespace] = name.split('/');
  return (
    nadNamespace &&
    !allowedNamespaces.includes(nadNamespace) && (
      <InvalidNADNamespace allowedNamespaces={allowedNamespaces} />
    )
  );
};
