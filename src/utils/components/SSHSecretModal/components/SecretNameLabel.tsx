import React, { FC } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type SecretNameLabelProps = {
  secretName: string;
};

const SecretNameLabel: FC<SecretNameLabelProps> = ({ secretName }) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(secretName)) return <span>{t('Not available')}</span>;

  return (
    <ResourceLink
      groupVersionKind={modelToGroupVersionKind(SecretModel)}
      linkTo={false}
      name={secretName}
    />
  );
};

export default SecretNameLabel;
