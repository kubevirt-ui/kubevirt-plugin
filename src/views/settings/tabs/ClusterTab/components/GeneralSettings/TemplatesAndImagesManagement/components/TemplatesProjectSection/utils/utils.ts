import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { TemplateModel, type V1Template } from '@kubevirt-utils/models';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getCommonTemplatesNamespacePatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import { getCommonTemplatesNamespace } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { type TemplateList } from '@kubevirt-utils/resources/template/utils/types';
import { getErrorMessage } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

const TYPE_LABEL = 'template.kubevirt.io/type';
const BASE = 'base';

export const OPENSHIFT = 'openshift';

export const getCurrentTemplatesNamespaceFromHCO = (hyperConverged: HyperConverged): string =>
  getCommonTemplatesNamespace(hyperConverged) ?? OPENSHIFT;

export const updateHCOCommonTemplatesNamespace = async (
  hyperConverged: HyperConverged,
  newNamespace: null | number | string,
  handleError: (value: string) => void,
  handleLoading: (value: boolean) => void,
  cluster?: string,
): Promise<void> => {
  const currentTemplatesNamespace = getCurrentTemplatesNamespaceFromHCO(hyperConverged);
  if (newNamespace !== currentTemplatesNamespace) {
    handleLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: buildHyperConvergedPatch(hyperConverged, {
          op: 'replace',
          path: getCommonTemplatesNamespacePatchPath(hyperConverged),
          value: newNamespace === OPENSHIFT ? null : newNamespace,
        }),
        model: getHyperConvergedModelFromResource(hyperConverged),
        resource: hyperConverged,
      });

      const templates = await kubevirtK8sGet<TemplateList>({
        cluster,
        model: TemplateModel,
        ns: currentTemplatesNamespace,
      });

      const commonTemplates = templates?.items?.filter(
        (template) => template?.metadata?.labels?.[TYPE_LABEL] === BASE,
      );

      const templatesDeletePromisesArray = commonTemplates?.map((template) =>
        kubevirtK8sDelete<V1Template>({
          cluster,
          model: TemplateModel,
          resource: template,
        }),
      );

      await Promise.all<Promise<V1Template>[]>(templatesDeletePromisesArray);
    } catch (error: unknown) {
      handleError(getErrorMessage(error));
    } finally {
      handleLoading(false);
    }
  }
};
