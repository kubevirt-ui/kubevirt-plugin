import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import {
  getTemplateOS,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template/utils/selectors';

import { ensurePath, useWizardVMContext } from '../../../utils/WizardVMContext';
import { DEFAULT_NAMESPACE } from '../../constants';
import { processTemplate } from '../../utils';

type useCustomizeFormSubmitType = [
  onSubmit: (event: any) => Promise<void>,
  loaded: boolean,
  error: any,
];

export const useCustomizeFormSubmit = (
  template: V1Template,
  withWindowsDrivers?: boolean,
): useCustomizeFormSubmitType => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const [templateLoaded, setTemplateLoaded] = React.useState(true);
  const [templateError, setTemplateError] = React.useState<any>();

  const { updateVM, updateTabsData, loaded: vmLoaded, error: vmError } = useWizardVMContext();

  const onSubmit = async (event) => {
    event.preventDefault();
    setTemplateLoaded(false);
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const processedTemplate = await processTemplate({
        template,
        namespace: ns || DEFAULT_NAMESPACE,
        formData,
        withWindowsDrivers,
      });

      const vm = getTemplateVirtualMachineObject(processedTemplate);
      vm.metadata.namespace = ns || DEFAULT_NAMESPACE;
      vm.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
      vm.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = processedTemplate.metadata.namespace;

      // keep template's name and namespace for navigation
      updateTabsData((tabsDataDraft) => {
        ensurePath(tabsDataDraft, 'overview.templateMetadata');
        tabsDataDraft.overview.templateMetadata.name = template.metadata.name;
        tabsDataDraft.overview.templateMetadata.namespace = template.metadata.namespace;
        tabsDataDraft.overview.templateMetadata.osType = getTemplateOS(template);
        tabsDataDraft.overview.templateMetadata.displayName = getAnnotation(
          template,
          ANNOTATIONS.displayName,
        );
      });
      await updateVM(vm);
      history.push(`/k8s/ns/${ns || 'default'}/templatescatalog/review`);

      setTemplateError(undefined);
    } catch (error) {
      console.error(error);
      setTemplateError(error);
    } finally {
      setTemplateLoaded(true);
    }
  };

  return [onSubmit, templateLoaded && vmLoaded, templateError || vmError];
};
