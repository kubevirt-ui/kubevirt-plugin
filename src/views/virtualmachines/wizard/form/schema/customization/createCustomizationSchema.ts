import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';

import { type VMWizardCustomizationValues } from '../../types';
import { getValidationMessage } from '../shared/messages';

type CustomizationSchemaOptions = {
  requiredLabels?: readonly AutoAppliedLabel[];
};

export const createCustomizationSchema = (
  { requiredLabels = [] }: CustomizationSchemaOptions = {},
  t: TFunction,
): yup.ObjectSchema<VMWizardCustomizationValues> => {
  const vmDraftSchema = yup
    .mixed<NonNullable<VMWizardCustomizationValues['vmDraft']>>()
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
    .nullable()
    .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t));

  return yup
    .object({
      autoLabelsApplied: yup.boolean().defined(),
      pendingUploadKeys: yup.array().of(yup.string().defined()).defined(),
      templateAdditionalObjects: yup
        .array()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      vmDraft: vmDraftSchema.test('required-vm-labels', function (value) {
        if (!value) return true;

        const labels = value.metadata?.labels ?? {};
        const missingKeys = requiredLabels
          .filter((label) => label.required && !String(labels[label.key] ?? '').trim())
          .map(({ key }) => key)
          .sort((left, right) => left.localeCompare(right));

        if (!missingKeys.length) return true;

        const message =
          missingKeys.length === 1
            ? getValidationMessage('REQUIRED_LABEL_MESSAGE', t, { label: missingKeys[0] })
            : getValidationMessage('REQUIRED_LABELS_MESSAGE', t, {
                labels: missingKeys.join(', '),
              });

        return this.createError({
          message,
          path: `${this.path}.metadata.labels`,
        });
      }),
    })
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t));
};
