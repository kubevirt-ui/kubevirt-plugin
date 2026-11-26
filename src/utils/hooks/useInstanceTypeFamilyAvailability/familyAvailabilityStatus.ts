import type { TFunction } from 'i18next';

import type { LabelProps } from '@patternfly/react-core';

export const getFamilySelectorVisibilityStatus = (
  isVisibleInSelectors: boolean,
  t: TFunction,
): { color: LabelProps['color']; label: string } => ({
  color: isVisibleInSelectors ? 'green' : 'orange',
  label: isVisibleInSelectors ? t('Shown in selectors') : t('Hidden from selectors'),
});

export const getAllInstanceTypeFamiliesDisabledWarning = (t: TFunction): string =>
  t(
    'All instance type families are disabled. Enable at least one family so they appear in compute resource pickers.',
  );

export const getAllInstanceTypeFamiliesDisabledMessage = (
  t: TFunction,
  canEdit: boolean,
): string => {
  if (canEdit) {
    return getAllInstanceTypeFamiliesDisabledWarning(t);
  }

  return t(
    'All instance type families are disabled. Contact your cluster administrator to enable at least one family.',
  );
};
