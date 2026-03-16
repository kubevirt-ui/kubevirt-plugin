import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const getCurrentBootableVolumesNamespaceFromHCO = (hyperConverged: HyperConverged): string =>
  hyperConverged?.spec?.commonBootImageNamespace || OPENSHIFT_OS_IMAGES_NS;

export const updateHCOBootableVolumesNamespace = async (
  hyperConverged: HyperConverged,
  newNamespace: null | number | string,
  handelError: (value: string) => void,
  handleLoading: (value: boolean) => void,
  cluster?: string,
) => {
  const currentTemplatesNamespace = getCurrentBootableVolumesNamespaceFromHCO(hyperConverged);
  if (newNamespace !== currentTemplatesNamespace) {
    handleLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: [
          {
            op: 'replace',
            path: `/spec/commonBootImageNamespace`,
            value: newNamespace === OPENSHIFT_OS_IMAGES_NS ? null : newNamespace,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverged,
      });
    } catch (error) {
      handelError(error?.message || error);
    } finally {
      handleLoading(false);
    }
  }
};
