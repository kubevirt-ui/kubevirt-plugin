import { useEffect, useMemo } from 'react';
import useMultipleAccessReviews from 'src/views/cdi-upload-provider/hooks/useMultipleAccessReviews';

import {
  modelToGroupVersionKind,
  ProjectModel,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtHyperconvergeConfiguration, {
  KubevirtHyperconverged,
} from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  K8sVerb,
  SetFeatureFlag,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_KUBEVIRT_VIRTUALIZATION_NAV } from './consts';

const MANUAL_ROLE_AGGREGATION = 'Manual';

const getRoleAggregationStrategy = (hcConfig: KubevirtHyperconverged): string | undefined =>
  hcConfig?.spec?.configuration?.roleAggregationStrategy;

const useVirtualizationNavVisibilityFlag = (setFeatureFlag: SetFeatureFlag) => {
  const { hcConfig, hcError, hcLoaded } = useKubevirtHyperconvergeConfiguration();

  const [projects, projectsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const strategy = getRoleAggregationStrategy(hcConfig);

  const isManualRoleAggregation = useMemo(() => strategy === MANUAL_ROLE_AGGREGATION, [strategy]);

  const fetchAccessReview = hcLoaded && projectsLoaded && isManualRoleAggregation;

  const projectNames = useMemo(
    () =>
      (projects ?? [])
        .map((p) => getName(p))
        .filter((n) => !isEmpty(n))
        .sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const [allowed, accessReviewsLoading] = useMultipleAccessReviews(
    fetchAccessReview
      ? projectNames.map((name) => ({
          group: VirtualMachineModel.apiGroup,
          namespace: name,
          resource: VirtualMachineModel.plural,
          verb: 'list' as K8sVerb,
        }))
      : [],
  );

  const isAllowed = useMemo(() => allowed.some((accessReview) => accessReview.allowed), [allowed]);

  useEffect(() => {
    if (hcError) {
      setFeatureFlag(FLAG_KUBEVIRT_VIRTUALIZATION_NAV, true);
      return;
    }

    if (!hcLoaded) return;

    if (!isManualRoleAggregation) {
      setFeatureFlag(FLAG_KUBEVIRT_VIRTUALIZATION_NAV, true);
      return;
    }

    if (isAllowed) {
      setFeatureFlag(FLAG_KUBEVIRT_VIRTUALIZATION_NAV, true);
      return;
    }

    if (accessReviewsLoading && !isAllowed) {
      setFeatureFlag(FLAG_KUBEVIRT_VIRTUALIZATION_NAV, false);
      return;
    }

    setFeatureFlag(FLAG_KUBEVIRT_VIRTUALIZATION_NAV, false);
  }, [setFeatureFlag, isAllowed, isManualRoleAggregation, hcLoaded, hcError, accessReviewsLoading]);
};

export default useVirtualizationNavVisibilityFlag;
