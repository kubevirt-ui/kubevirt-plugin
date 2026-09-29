import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import useHyperConvergedModel from '@kubevirt-utils/resources/hyperconverged/hooks/useHyperConvergedModel';
import { type HyperConverged } from '@kubevirt-utils/resources/hyperconverged/types';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

export type { HyperConverged } from '@kubevirt-utils/resources/hyperconverged/types';

const getHyperConvergedObject = (hyperConverged): HyperConverged => {
  if (isEmpty(hyperConverged)) return null;
  if (hyperConverged?.items) return hyperConverged?.items?.[0];
  if (Array.isArray(hyperConverged)) return hyperConverged?.[0];
  return hyperConverged;
};

type UseHyperConvergeConfigurationType = (
  cluster?: string,
) => [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error | undefined];

const useHyperConvergeConfiguration: UseHyperConvergeConfigurationType = (cluster) => {
  const operatorNamespace = operatorNamespaceSignal.value;
  const { groupVersionKind, loading: versionLoading } = useHyperConvergedModel(cluster);

  const [hyperConvergeData, hyperConvergeDataLoaded, hyperConvergeDataError] = useK8sWatchData<
    HyperConverged[]
  >(
    operatorNamespace &&
      !versionLoading && {
        cluster,
        groupVersionKind,
        isList: true,
        namespace: operatorNamespace,
      },
  );

  const hcoLoaded = hyperConvergeDataLoaded && !isEmpty(operatorNamespace) && !versionLoading;

  const hyperConverge = useMemo(
    () => getHyperConvergedObject(hyperConvergeData),
    [hyperConvergeData],
  );

  const memoizedHyperconvergedConfig = useDeepCompareMemoize(hyperConverge);

  return [memoizedHyperconvergedConfig, hcoLoaded, hyperConvergeDataError];
};

export default useHyperConvergeConfiguration;
