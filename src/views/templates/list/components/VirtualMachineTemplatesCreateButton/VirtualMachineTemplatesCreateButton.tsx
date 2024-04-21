import React, { FC } from 'react';

import { modelToRef, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreate } from '@openshift-console/dynamic-plugin-sdk';

type VirtualMachineTemplatesCreateButtonProps = {
  namespace: string;
};

const VirtualMachineTemplatesCreateButton: FC<VirtualMachineTemplatesCreateButtonProps> = ({
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageCreate
      createAccessReview={{ groupVersionKind: modelToRef(TemplateModel), namespace }}
      groupVersionKind={modelToRef(TemplateModel)}
    >
      {t('Create Template')}
    </ListPageCreate>
  );
};

export default VirtualMachineTemplatesCreateButton;
