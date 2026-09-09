import { useMemo } from 'react';

import {
  type V1NodeNetworkConfigurationPolicy,
  type V1NodeNetworkConfigurationPolicySpec,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { type SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import {
  modelToGroupVersionKind,
  NodeNetworkConfigurationPolicyModel,
} from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { toWatchError } from '../utils';

import { getNNCPSpecListForLocalnetObject } from '../form/utils/utils';

const usePhysicalNetworkOptions = (): [
  SelectTypeaheadOptionProps[],
  Record<string, V1NodeNetworkConfigurationPolicySpec[]>,
  boolean,
  Error | undefined,
] => {
  const watchResult = useK8sWatchResource<V1NodeNetworkConfigurationPolicy[]>({
    groupVersionKind: modelToGroupVersionKind(NodeNetworkConfigurationPolicyModel),
    isList: true,
    namespaced: false,
  });
  const policies = watchResult[0];
  const policiesLoaded = watchResult[1];
  const policiesLoadError = toWatchError(watchResult[2]);

  const nncpSpecListForLocalnet = useMemo(
    () => getNNCPSpecListForLocalnetObject(policies),
    [policies],
  );

  const physicalNetworkOptions = useMemo<SelectTypeaheadOptionProps[]>(() => {
    return Object.keys(nncpSpecListForLocalnet).map((option) => ({
      value: option,
    }));
  }, [nncpSpecListForLocalnet]);

  return [physicalNetworkOptions, nncpSpecListForLocalnet, policiesLoaded, policiesLoadError];
};

export default usePhysicalNetworkOptions;
