import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const getCurrentBootableVolumesNamespaceFromHCO = (hyperConverged: HyperConverged): string =>
  hyperConverged?.spec?.commonBootImageNamespace || OPENSHIFT_OS_IMAGES_NS;

export const updateHCOBootableVolumesNamespace = async (
  hyperConverged: HyperConverged,
  newNamespace: null | number | string,
  handelError: (value: string) => void,
  handleLoading: (value: boolean) => void,
) => {
  const currentTemplatesNamespace = getCurrentBootableVolumesNamespaceFromHCO(hyperConverged);
  if (newNamespace !== currentTemplatesNamespace) {
    handleLoading(true);
    try {
      await k8sPatch<HyperConverged>({
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
