import produce from 'immer';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import {
  ProcessedTemplatesModel,
  TemplateParameter,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { CDI_BIND_REQUESTED_ANNOTATION } from '@kubevirt-utils/hooks/useCDIUpload/consts';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { mountWinDriversToTemplate } from '@kubevirt-utils/resources/template/utils/drivers';
import {
  getTemplateParameterValue,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { NAME_INPUT_FIELD } from './constants';

export const overrideVirtualMachineDataVolumeSpec = (
  virtualMachine: V1VirtualMachine,
  customSource?: V1beta1DataVolumeSpec,
): V1VirtualMachine => {
  return produceVMDisks(virtualMachine, (draftVM) => {
    const dataVolumeTemplate = draftVM.spec.dataVolumeTemplates[0];
    if (dataVolumeTemplate && Boolean(customSource)) {
      draftVM.spec.dataVolumeTemplates[0].spec = customSource;

      const shouldAddImmediateBind = customSource?.source?.blank || customSource?.source?.upload;

      if (shouldAddImmediateBind) {
        dataVolumeTemplate.metadata.annotations = {
          ...(dataVolumeTemplate?.metadata?.annotations || {}),
          [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
        };
      }
    }
  });
};

export const setTemplateParameters = (template: V1Template, formData: FormData): V1Template => {
  template.parameters = template?.parameters?.map((parameter) => {
    const formParameter = formData.get(parameter.name) as string;
    if (formParameter.length > 0) parameter.value = formParameter;

    return {
      ...parameter,
      value: formParameter.length > 0 ? formParameter : parameter.value,
    };
  });
  return template;
};

export const replaceTemplateParameterValue = (
  template: V1Template,
  parameterName: string,
  value: string,
): V1Template => {
  const parameterIndex = template.parameters.findIndex(
    (parameter) => parameter.name === parameterName,
  );

  if (parameterIndex >= 0) template.parameters[parameterIndex].value = value;

  return template;
};

export const hasCustomizableSource = (template: V1Template): boolean => {
  const virtualMachine = getTemplateVirtualMachineObject(template);
  const dataVolumeTemplates = virtualMachine?.spec?.dataVolumeTemplates;

  if (!dataVolumeTemplates || dataVolumeTemplates.length !== 1) return false;

  if (!dataVolumeTemplates[0].spec.source && !dataVolumeTemplates[0].spec.sourceRef) return false;

  return true;
};

export const isNameParameterExists = (template: V1Template): boolean =>
  !isEmpty(template?.parameters) &&
  !isEmpty(template?.parameters?.find((param) => param?.name === NAME_INPUT_FIELD));

export const getTemplateNameParameterValue = (template: V1Template): string =>
  getTemplateParameterValue(template, NAME_INPUT_FIELD);

export const processTemplate = async ({
  formData,
  namespace = DEFAULT_NAMESPACE,
  template,
  withWindowsDrivers,
}: {
  formData: FormData;
  namespace: string;
  template: V1Template;
  withWindowsDrivers?: boolean;
}): Promise<V1Template> => {
  const virtualMachineName = formData.get(NAME_INPUT_FIELD) as string;

  let templateToProcess = produce(template, (draftTemplate) => {
    let draftVMTemplate = draftTemplate;
    draftVMTemplate.metadata.namespace = namespace;

    const parameterForName = NAME_INPUT_FIELD;

    draftVMTemplate = setTemplateParameters(draftVMTemplate, formData);

    draftVMTemplate = replaceTemplateParameterValue(
      draftVMTemplate,
      parameterForName,
      virtualMachineName,
    );

    const draftVM = getTemplateVirtualMachineObject(draftVMTemplate);
    draftVM.metadata.name = virtualMachineName;
  });

  if (withWindowsDrivers) {
    templateToProcess = await mountWinDriversToTemplate(templateToProcess);
  }

  return await k8sCreate<V1Template>({
    data: { ...templateToProcess, metadata: { ...template?.metadata, namespace } },
    model: ProcessedTemplatesModel,
    queryParams: {
      dryRun: 'All',
    },
  });
};

export const getVirtualMachineNameField = (vmName: string): TemplateParameter => {
  return {
    description: t('VirtualMachine name'),
    displayName: t('Name'),
    name: NAME_INPUT_FIELD,
    required: true,
    value: vmName,
  };
};

export const buildFields = (template: V1Template): Array<TemplateParameter[]> => {
  const optionalFields = template.parameters?.filter(
    (parameter) => !parameter.required && NAME_INPUT_FIELD !== parameter.name,
  );
  const requiredFields = template.parameters?.filter(
    (parameter) => parameter.required && NAME_INPUT_FIELD !== parameter.name,
  );

  return [requiredFields, optionalFields];
};

export const getUploadDataVolume = (
  name: string,
  namespace: string,
  storage?: string,
): V1beta1DataVolume => ({
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name,
    namespace,
  },
  spec: {
    source: {
      upload: {},
    },
    storage: {
      resources: {
        requests: {
          storage,
        },
      },
    },
  },
});
