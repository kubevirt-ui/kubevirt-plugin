import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type Template } from '@kubevirt-utils/resources/template';
import { NAME_INPUT_FIELD } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

import { type VMWizardTemplateValues } from '../../types';
import {
  INVALID_FIELD_MESSAGE,
  MIN_PASSWORD_LENGTH_MESSAGE,
  SELECT_TEMPLATE_MESSAGE,
} from '../shared/messages';

export const createParameterValueSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .defined()
    .min(5, t(MIN_PASSWORD_LENGTH_MESSAGE, { minLength: 5 }));

export const createTemplateParametersSchema = (t: TFunction): yup.Schema<TemplateParameter[]> =>
  yup
    .array()
    .of(
      yup
        .mixed<TemplateParameter>()
        .defined()
        .test('editor-parameter', function (parameter) {
          if (!parameter.required || parameter.name === NAME_INPUT_FIELD) return true;
          try {
            createParameterValueSchema(t).validateSync(parameter.value ?? '');
            return true;
          } catch (error) {
            return this.createError({
              message: (error as yup.ValidationError).message,
              path: `${this.path}.value`,
            });
          }
        }),
    )
    .defined();

export const createTemplateSchema = (t: TFunction): yup.ObjectSchema<VMWizardTemplateValues> =>
  yup
    .object({
      lastProcessedKey: yup.string().defined(),
      selectedTemplate: yup
        .mixed<Template>()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .required(t(SELECT_TEMPLATE_MESSAGE)),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));
