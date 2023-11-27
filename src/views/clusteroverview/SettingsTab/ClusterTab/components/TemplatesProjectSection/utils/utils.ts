import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { k8sDelete, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateList } from '../../../../../utils/types';

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
) => {
  const currentTemplatesNamespace = getCurrentTemplatesNamespaceFromHCO(hyperConverged);
  if (newNamespace !== currentTemplatesNamespace) {
    handleLoading(true);
    try {
      await k8sPatch<HyperConverged>({
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

      const templates = await k8sGet<TemplateList>({
        model: TemplateModel,
        ns: currentTemplatesNamespace,
      });

      const commonTemplates = templates?.items?.filter(
        (template) => template?.metadata?.labels?.[TYPE_LABEL] === BASE,
      );

      const templatesDeletePromisesArray = commonTemplates?.map((template) =>
        k8sDelete<V1Template>({
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
