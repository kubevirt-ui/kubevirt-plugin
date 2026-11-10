import type { TFunction } from 'i18next';

import type { LabelProps } from '@patternfly/react-core';

export const getFamilySelectorVisibilityStatus = (
  isVisibleInSelectors: boolean,
  t: TFunction,
): { color: LabelProps['color']; label: string } => ({
  color: isVisibleInSelectors ? 'green' : 'orange',
  label: isVisibleInSelectors ? t('Shown in selectors') : t('Hidden from selectors'),
});
