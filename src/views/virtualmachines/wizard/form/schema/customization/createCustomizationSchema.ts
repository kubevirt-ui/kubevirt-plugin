import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';

import { type VMWizardCustomizationValues } from '../../types';
import {
  INVALID_FIELD_MESSAGE,
  REQUIRED_FIELD_MESSAGE,
  REQUIRED_LABEL_MESSAGE,
  REQUIRED_LABELS_MESSAGE,
} from '../shared/messages';

type CustomizationSchemaOptions = {
  requiredLabels?: readonly AutoAppliedLabel[];
};

export const createCustomizationSchema = (
  { requiredLabels = [] }: CustomizationSchemaOptions = {},
  t: TFunction,
): yup.ObjectSchema<VMWizardCustomizationValues> => {
  const vmDraftSchema = yup
    .mixed<NonNullable<VMWizardCustomizationValues['vmDraft']>>()
    .typeError(t(INVALID_FIELD_MESSAGE))
    .nullable()
    .defined(t(REQUIRED_FIELD_MESSAGE));

  return yup
    .object({
      autoLabelsApplied: yup.boolean().defined(),
      pendingBootableVolumeUploadKeys: yup.array().of(yup.string().defined()).defined(),
      templateAdditionalObjects: yup
        .array()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
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
            ? t(REQUIRED_LABEL_MESSAGE, { label: missingKeys[0] })
            : t(REQUIRED_LABELS_MESSAGE, { labels: missingKeys.join(', ') });

        return this.createError({
          message,
          path: `${this.path}.metadata.labels`,
        });
      }),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));
};
