import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  createTemplateDraft,
  getParameters,
  isVirtualMachineTemplate,
  processOpenShiftTemplate,
  replaceTemplateParameters,
  type Template,
} from '@kubevirt-utils/resources/template';
import { generateParamsWithPrettyName } from '@kubevirt-utils/resources/template/utils/helpers';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

const useVMTemplateGeneratedParams = (
  template: Template,
  namespaceOverride?: string,
): [template: Template, loading: boolean, error: Error] => {
  const { control } = useVMWizard();
  const [cluster, project] = useWatch({
    control,
    name: [CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER, CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT],
  });
  const [error, setError] = useState<Error>();
  const namespace = namespaceOverride || project || DEFAULT_NAMESPACE;
  const [templateWithGeneratedValues, setTemplateWithGeneratedValues] = useState<Template>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!template) return;
    const parameters = generateParamsWithPrettyName(template);
    const { excludedParameters, parametersToGenerate } = parameters.reduce(
      (acc, parameter) => {
        if (parameter?.generate) {
          acc.parametersToGenerate.push(parameter);
          return acc;
        }

        acc.excludedParameters.push(parameter);
        return acc;
      },
      { excludedParameters: [], parametersToGenerate: [] },
    );

    // VirtualMachineTemplates are processed on Next, not on selection.
    if (isEmpty(parametersToGenerate) || isVirtualMachineTemplate(template)) {
      setError(null);
      setLoading(false);
      setTemplateWithGeneratedValues(replaceTemplateParameters(template, parameters));
      return;
    }

    setLoading(true);
    const templateDraft = createTemplateDraft(template, namespace, parametersToGenerate);

    processOpenShiftTemplate(templateDraft as V1Template, namespace, cluster)
      .then((processedTemplate) => {
        const mergedParameters = [
          ...(getParameters(processedTemplate) ?? []),
          ...excludedParameters,
        ];

        setTemplateWithGeneratedValues(replaceTemplateParameters(templateDraft, mergedParameters));
        setError(null);
        setLoading(false);
      })
      .catch((apiError: Error) => {
        setTemplateWithGeneratedValues(templateDraft);
        setError(apiError);
        setLoading(false);
      });
  }, [namespace, template, cluster]);

  return [templateWithGeneratedValues, loading, error];
};

export default useVMTemplateGeneratedParams;
