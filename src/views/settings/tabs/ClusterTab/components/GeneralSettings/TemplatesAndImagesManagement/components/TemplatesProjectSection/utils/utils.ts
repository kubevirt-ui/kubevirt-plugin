import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { kubevirtK8sDelete, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { TemplateList } from '@overview/utils/types';

const TYPE_LABEL = 'template.kubevirt.io/type';
const BASE = 'base';

export const OPENSHIFT = 'openshift';

export const getCurrentTemplatesNamespaceFromHCO = (hyperConverged: HyperConverged): string =>
  hyperConverged?.spec?.commonTemplatesNamespace || OPENSHIFT;

export const updateHCOCommonTemplatesNamespace = async (
  hyperConverged: HyperConverged,
  newNamespace: null | number | string,
  handelError: (value: string) => void,
  handleLoading: (value: boolean) => void,
  cluster?: string,
) => {
  const currentTemplatesNamespace = getCurrentTemplatesNamespaceFromHCO(hyperConverged);
  if (newNamespace !== currentTemplatesNamespace) {
    handleLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: [
          {
            op: 'replace',
            path: `/spec/commonTemplatesNamespace`,
            value: newNamespace === OPENSHIFT ? null : newNamespace,
          },
        ],
        model: HyperConvergedModel,
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
    } catch (error) {
      handelError(error?.message || error);
    } finally {
      handleLoading(false);
    }
  }
};
