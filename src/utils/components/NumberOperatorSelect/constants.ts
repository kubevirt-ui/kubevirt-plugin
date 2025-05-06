import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SimpleSelectOption } from '@patternfly/react-templates';

export enum NumberOperator {
  Equals = 'Equals',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
}

export const numberOperatorSelectOptions: SimpleSelectOption[] = [
  { content: t('Greater than'), value: NumberOperator.GreaterThan },
  { content: t('Less than'), value: NumberOperator.LessThan },
  { content: t('Equals'), value: NumberOperator.Equals },
];
