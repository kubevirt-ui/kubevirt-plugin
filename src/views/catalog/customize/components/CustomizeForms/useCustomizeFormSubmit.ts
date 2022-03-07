import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';

import { useWizardVMContext } from '../../../utils/WizardVMContext';
import { DEFAULT_NAMESPACE } from '../../constants';
import { processTemplate } from '../../utils';

type useCustomizeFormSubmitType = [
  onSubmit: (event: any) => Promise<void>,
  loaded: boolean,
  error: any,
];

export const useCustomizeFormSubmit = (
  template: V1Template,
  customSource?: V1beta1DataVolumeSpec,
): useCustomizeFormSubmitType => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const [templateLoaded, setTemplateLoaded] = React.useState(true);
  const [templateError, setTemplateError] = React.useState<any>();

  const { updateVM, loaded: vmLoaded, error: vmError } = useWizardVMContext();

  const onSubmit = async (event) => {
    event.preventDefault();
    setTemplateLoaded(false);
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);

      const processedTemplate = await processTemplate(template, formData, customSource);

      const vm = getTemplateVirtualMachineObject(processedTemplate);
      vm.metadata.namespace = ns || DEFAULT_NAMESPACE;

      await updateVM(vm);
      history.push(
        `/k8s/ns/${ns || 'default'}/templatescatalog/review?name=${
          template.metadata.name
        }&namespace=${template.metadata.namespace}`,
      );
    } catch (error) {
      console.error(error);
      setTemplateError(error);
    } finally {
      setTemplateLoaded(true);
    }
  };

  return [onSubmit, templateLoaded && vmLoaded, templateError || vmError];
};
