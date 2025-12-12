import { HyperConvergedModel } from '@kubevirt-ui/kubevirt-api/console';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { getAnnotation, getAnnotations } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';

import { PASST_ANNOTATION } from './constants';

const usePasstFeatureFlag = () => {
  const [hyperConvergeConfiguration, hcoLoaded] = useHyperConvergeConfiguration();
  const isAdmin = useIsAdmin();

  return {
    canEdit: isAdmin,
    featureEnabled: getAnnotation(hyperConvergeConfiguration, PASST_ANNOTATION) === 'true',
    loading: !hcoLoaded,
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
