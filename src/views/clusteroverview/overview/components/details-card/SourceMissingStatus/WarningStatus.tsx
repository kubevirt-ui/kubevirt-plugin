import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GenericStatus,
  StatusComponentProps,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

const WarningStatus: React.FC<StatusComponentProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const { title } = props;

  return (
    <GenericStatus {...props} Icon={YellowExclamationTriangleIcon} title={title || t('Warning')} />
  );
};

export default WarningStatus;
