import { useForm, type UseFormReturn } from 'react-hook-form';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { OPENSHIFT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type Template } from '@kubevirt-utils/resources/template';

import { cloneTemplateSubmit } from '../onSubmit';

import { type CloneTemplateFormValues } from '../form/types';
import { getInitialFormValues } from '../form/utils';

type UseCloneTemplateReturn = {
  form: UseFormReturn<CloneTemplateFormValues>;
  onSubmit: () => Promise<void>;
  onTemplateSelected: (template: Template) => void;
};

const useCloneTemplate = (
  initialTemplate?: Template,
  onTemplateCloned?: (clonedTemplate: V1Template) => void,
): UseCloneTemplateReturn => {
  const namespace = useNamespaceParam() as string | undefined;

  const form = useForm<CloneTemplateFormValues>({
    defaultValues: getInitialFormValues(initialTemplate, namespace ?? OPENSHIFT_NAMESPACE),
    mode: 'onChange',
  });

  const onTemplateSelected = (newTemplate: Template): void =>
    form.reset(getInitialFormValues(newTemplate, getNamespace(newTemplate)));

  const onSubmit = async (): Promise<void> =>
    cloneTemplateSubmit({
      formValues: form.getValues(),
      onTemplateCloned,
    });

  return {
    form,
    onSubmit,
    onTemplateSelected,
  };
};

export default useCloneTemplate;
