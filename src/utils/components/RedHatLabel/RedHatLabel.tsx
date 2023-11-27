import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { COMMON_INSTANCETYPES } from '@kubevirt-utils/resources/bootableresources/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { APP_NAME_LABEL } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

type RedHatLabelProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  obj: T;
};

const RedHatLabel: FC<RedHatLabelProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();

  if (getLabel(obj, APP_NAME_LABEL) !== COMMON_INSTANCETYPES) return null;

  return <Label>{t('Red Hat')}</Label>;
};

export default RedHatLabel;
