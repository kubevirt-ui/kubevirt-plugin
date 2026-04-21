import React, { FC } from 'react';

import { V1alpha1VirtualMachineTemplateRequest } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip } from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import { VMTemplateRequestStatus } from './constants';
import { getVMTemplateRequestStatus, getVMTemplateRequestStatusMessage } from './utils';

type VirtualMachineTemplateRequestStatusIconProps = {
  vmtr: V1alpha1VirtualMachineTemplateRequest;
};

const VirtualMachineTemplateRequestStatusIcon: FC<
  VirtualMachineTemplateRequestStatusIconProps
> = ({ vmtr }) => {
  const { t } = useKubevirtTranslation();
  const status = getVMTemplateRequestStatus(vmtr);
  const message = getVMTemplateRequestStatusMessage(vmtr);

  if (status === VMTemplateRequestStatus.Succeeded) {
    return null;
  }

  if (status === VMTemplateRequestStatus.Failed) {
    return (
      <Tooltip content={message || t('Unknown error')}>
        <span>
          <RedExclamationCircleIcon />
          <span className="pf-v6-u-ml-sm">{t('Failed')}</span>
        </span>
      </Tooltip>
    );
  }

  return (
    <span>
      <InProgressIcon />
      <span className="pf-v6-u-ml-sm">{t('In progress')}</span>
    </span>
  );
};

export default VirtualMachineTemplateRequestStatusIcon;
