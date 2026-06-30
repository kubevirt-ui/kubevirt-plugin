import { useMemo, useState } from 'react';

import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { ValidatedOptions } from '@patternfly/react-core';

import { podNetworkExists } from '../../utils/helpers';
import useNADsData from '../hooks/useNADsData';
import {
  buildNetworkSelectOptions,
  getCurrentlyUsedNADFullNames,
  getShowPodNetworkingOption,
} from './editNetworkSelectUtils';
import {
  type NetworkInterfaceNetworkSelectProps,
  type NetworkSelectTypeaheadOptionProps,
  type UseNetworkInterfaceDataReturn,
} from './types';
import useEditNetworkSelect from './useEditNetworkSelect';
import { useNetworkAutoSelect } from './useNetworkAutoSelect';
import { buildValidators } from './utils';

/**
 *
 * @param root0
 * @param root0.editInitValueNetworkName
 * @param root0.isEditing
 * @param root0.namespace
 * @param root0.networkName
 * @param root0.setInterfaceType
 * @param root0.setNetworkName
 * @param root0.setSubmitDisabled
 * @param root0.vm
 */
export default function useNetworkInterfaceData({
  editInitValueNetworkName,
  isEditing,
  namespace,
  networkName,
  setInterfaceType,
  setNetworkName,
  setSubmitDisabled,
  vm,
}: NetworkInterfaceNetworkSelectProps): UseNetworkInterfaceDataReturn {
  const { t } = useKubevirtTranslation();
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(getCluster(vm));
  const vmiNamespace = getNamespace(vm) ?? namespace;
  const { loaded, loadError, nads, primaryNADs } = useNADsData(vmiNamespace, getCluster(vm));
  const [isNamespaceManagedByUDN] = useNamespaceUDN(vmiNamespace);
  const podNetworkType = isNamespaceManagedByUDN
    ? interfaceTypesProxy.l2bridge
    : interfaceTypesProxy.masquerade;
  const [createdNetworkOptions, setCreatedNetworkOptions] = useState<
    NetworkSelectTypeaheadOptionProps[]
  >([]);

  const currentlyUsedNADFullNames = useMemo(() => getCurrentlyUsedNADFullNames(vm), [vm]);

  const {
    filteredNADs,
    selectedFirstOnLoad,
    selectNetworkName,
    selectTypeaheadKey,
    setSelectedFirstOnLoad,
  } = useEditNetworkSelect({
    currentlyUsedNADFullNames,
    editInitValueNetworkName,
    isEditing,
    loaded,
    nads,
    networkName,
    setSubmitDisabled,
    vmiNamespace,
  });

  const validators = buildValidators({
    currentlyUsedNADFullNames,
    nads,
    primaryNADs,
    t,
    vmiNamespace,
  });

  const hasPodNetwork = podNetworkExists(vm);
  const showPodNetworkingOption = getShowPodNetworkingOption({
    editInitValueNetworkName,
    hasPodNetwork,
    isEditing,
    isIPv6SingleStack,
  });
  const canCreateNetworkInterface = filteredNADs?.length > 0 || !hasPodNetwork;

  const networkOptions = useMemo(
    () =>
      buildNetworkSelectOptions({
        createdNetworkOptions,
        editInitValueNetworkName,
        filteredNADs,
        isEditing,
        podNetworkingText: t('Pod networking'),
        podNetworkType,
        selectNetworkName,
        showPodNetworkingOption,
        t,
        vmiNamespace,
      }),
    [
      showPodNetworkingOption,
      filteredNADs,
      vmiNamespace,
      createdNetworkOptions,
      podNetworkType,
      isEditing,
      editInitValueNetworkName,
      selectNetworkName,
      t,
    ],
  );

  const handleChange = useNetworkAutoSelect({
    canCreateNetworkInterface,
    isEditing,
    loaded,
    loadError,
    networkName,
    networkOptions,
    podNetworkType,
    selectedFirstOnLoad,
    setInterfaceType,
    setNetworkName,
    setSelectedFirstOnLoad,
    setSubmitDisabled,
  });

  return {
    handleChange,
    loaded,
    networkOptions,
    selectNetworkName,
    selectTypeaheadKey,
    setCreatedNetworkOptions,
    t,
    validated:
      canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error,
    validators,
  };
}
