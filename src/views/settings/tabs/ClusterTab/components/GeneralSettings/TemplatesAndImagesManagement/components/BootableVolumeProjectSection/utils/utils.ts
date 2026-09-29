import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getCommonBootImageNamespacePatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import { getCommonBootImageNamespace } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getErrorMessage } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const getCurrentBootableVolumesNamespaceFromHCO = (hyperConverged: HyperConverged): string =>
  getCommonBootImageNamespace(hyperConverged) ?? OPENSHIFT_OS_IMAGES_NS;

export const updateHCOBootableVolumesNamespace = async (
  hyperConverged: HyperConverged,
  newNamespace: null | number | string,
  handleError: (value: string) => void,
  handleLoading: (value: boolean) => void,
  cluster?: string,
): Promise<void> => {
  const currentTemplatesNamespace = getCurrentBootableVolumesNamespaceFromHCO(hyperConverged);
  if (newNamespace !== currentTemplatesNamespace) {
    handleLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: buildHyperConvergedPatch(hyperConverged, {
          op: 'replace',
          path: getCommonBootImageNamespacePatchPath(hyperConverged),
          value: newNamespace === OPENSHIFT_OS_IMAGES_NS ? null : newNamespace,
        }),
        model: getHyperConvergedModelFromResource(hyperConverged),
        resource: hyperConverged,
      });
    } catch (error: unknown) {
      handleError(getErrorMessage(error));
    } finally {
      handleLoading(false);
    }
  }
};
