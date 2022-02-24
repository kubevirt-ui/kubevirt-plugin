import { TFunction } from 'react-i18next';

import { TemplateParameter, V1Template } from '@kubevirt-ui/kubevirt-api/console';

import { DISK_SOURCE } from './components/DiskSource';
import { CustomizeFormActions } from './customizeFormActions';
import {
  extractParameterNameFromMetadataName,
  FormErrors,
  getVirtualMachineNameField,
  hasCustomizableDiskSource,
} from './utils';

type State = {
  template: V1Template;
  diskSourceCustomization: DISK_SOURCE;
  loading: boolean;
  customizableDiskSource: boolean;
  parametersErrors: FormErrors['parameters'];
  diskSourceError: FormErrors['diskSource'];
  volumeError: FormErrors['volume'];
  requiredFields: TemplateParameter[];
  optionalFields: TemplateParameter[];
  apiError: string;
};

export const initialState: State = {
  template: undefined,
  loading: false,
  customizableDiskSource: false,
  diskSourceCustomization: undefined,
  parametersErrors: undefined,
  diskSourceError: undefined,
  volumeError: undefined,
  requiredFields: [],
  optionalFields: [],
  apiError: undefined,
};

const buildFields = (
  template: V1Template,
  parametersToFilter: string[],
  t: TFunction,
): Array<TemplateParameter[]> => {
  const optionalFields = template.parameters?.filter(
    (parameter) => !parameter.required && !parametersToFilter.includes(parameter.name),
  );
  const requiredFields = template.parameters?.filter(
    (parameter) => parameter.required && !parametersToFilter.includes(parameter.name),
  );

  requiredFields?.unshift(getVirtualMachineNameField(template, t));

  return [requiredFields, optionalFields];
};

export const initializeReducer = (template: V1Template, t: TFunction): State => {
  const parameterForName = extractParameterNameFromMetadataName(template);

  const [requiredFields, optionalFields] = buildFields(template, [parameterForName], t);

  return {
    ...initialState,
    requiredFields,
    optionalFields,
    customizableDiskSource: hasCustomizableDiskSource(template),
  };
};

export type Action =
  | { type: CustomizeFormActions.FormError; payload: FormErrors }
  | { type: CustomizeFormActions.Loading }
  | { type: CustomizeFormActions.Success }
  | { type: CustomizeFormActions.SetDiskSource; payload: DISK_SOURCE }
  | { type: CustomizeFormActions.ApiError; payload: string }
  | { type: CustomizeFormActions.SetParameter; payload: { value: string; parameter: string } };

export default (state: State, action: Action): State => {
  switch (action.type) {
    case CustomizeFormActions.Loading:
      return {
        ...state,
        loading: true,
      };
    case CustomizeFormActions.FormError:
      return {
        ...state,
        diskSourceError: action.payload?.diskSource,
        volumeError: action.payload?.volume,
        parametersErrors: action.payload?.parameters,
        loading: false,
      };
    case CustomizeFormActions.Success:
      return {
        ...state,
        loading: false,
      };
    case CustomizeFormActions.SetDiskSource:
      return {
        ...state,
        diskSourceCustomization: action.payload,
        diskSourceError: undefined,
      };
    case CustomizeFormActions.ApiError:
      return {
        ...state,
        apiError: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};
