import { NumberOperator, numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { SimpleSelectOption } from '@patternfly/react-templates';

export const numberOperatorSelectOptions: SimpleSelectOption[] = Object.keys(NumberOperator).map(
  (operator) => ({ content: numberOperatorInfo[operator].text, value: operator }),
);
