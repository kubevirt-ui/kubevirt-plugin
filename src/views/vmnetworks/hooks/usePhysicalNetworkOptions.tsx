import { useMemo } from 'react';

import {
  V1NodeNetworkConfigurationPolicy,
  V1NodeNetworkConfigurationPolicySpec,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import {
  modelToGroupVersionKind,
  NodeNetworkConfigurationPolicyModel,
} from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getNNCPSpecListForLocalnetObject } from '../form/utils/utils';

const usePhysicalNetworkOptions = (): [
  SelectTypeaheadOptionProps[],
  Record<string, V1NodeNetworkConfigurationPolicySpec[]>,
  boolean,
  Error,
] => {
  const [policies, policiesLoaded, policiesLoadError] = useK8sWatchResource<
    V1NodeNetworkConfigurationPolicy[]
  >({
    groupVersionKind: modelToGroupVersionKind(NodeNetworkConfigurationPolicyModel),
    isList: true,
    namespaced: false,
  });

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
