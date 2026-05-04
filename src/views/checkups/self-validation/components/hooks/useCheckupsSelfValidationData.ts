import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsData from '../../../utils/hooks/useCheckupsData';
import { SELF_VALIDATION_LABEL_VALUE, SELF_VALIDATION_RESULTS_ONLY_LABEL } from '../../utils';

const SELF_VALIDATION_JOB_MATCH_EXPRESSIONS = [
  { key: SELF_VALIDATION_RESULTS_ONLY_LABEL, operator: Operator.DoesNotExist },
];

const useCheckupsSelfValidationData = () =>
  useCheckupsData({
    jobMatchExpressions: SELF_VALIDATION_JOB_MATCH_EXPRESSIONS,
    labelValue: SELF_VALIDATION_LABEL_VALUE,
  });

export default useCheckupsSelfValidationData;
