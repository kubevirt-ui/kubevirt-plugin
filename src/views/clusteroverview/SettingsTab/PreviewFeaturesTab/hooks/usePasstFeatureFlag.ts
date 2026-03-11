import { useMemo } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { PASST_BINDING_NAME } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';

import { PASST_ANNOTATION } from './constants';

const usePasstFeatureFlag = () => {
  const { hcConfig, hcLoaded } = useKubevirtHyperconvergeConfiguration();
  const [hyperConvergeConfiguration] = useHyperConvergeConfiguration();
  const isAdmin = useIsAdmin();

  const featureEnabled = useMemo(
    () => Boolean(hcConfig?.spec?.configuration?.network?.binding?.[PASST_BINDING_NAME]),
    [hcConfig],
  );

  return {
    canEdit: isAdmin,
    featureEnabled,
    loading: !hcLoaded,
    toggleFeature: (val: boolean) => {
      const patch: Patch[] = [
        ...(isEmpty(getAnnotations(hyperConvergeConfiguration))
          ? [{ op: 'add', path: '/metadata/annotations', value: {} }]
          : []),
        {
          op: 'replace',
          path: `/metadata/annotations/${PASST_ANNOTATION.replace(/\//g, '~1')}`,
          value: val.toString(),
        },
      ];

      return k8sPatch({
        data: patch,
        model: HyperConvergedModel,
        resource: hyperConvergeConfiguration,
      });
    },
  };
};

export default usePasstFeatureFlag;
