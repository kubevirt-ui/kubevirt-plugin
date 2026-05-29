import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getCdromUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Spinner } from '@patternfly/react-core';

type MountIsoUploadLabelProps = {
  diskName: string;
  vm: V1VirtualMachine;
};

const MountIsoUploadLabel: FC<MountIsoUploadLabelProps> = ({ diskName, vm }) => {
  const { t } = useKubevirtTranslation();
  const uploadKey = getCdromUploadKeyFromVm(vm, diskName);
  const upload = useMountIsoUploadStore((state) => state.uploads[uploadKey]);

  if (upload?.status !== UPLOAD_ALERT_STATUS.UPLOADING) {
    return null;
  }

  const labelText = t('Upload in progress');

  return (
    <Label
      aria-label={t('{{diskName}}: upload in progress', { diskName })}
      color="blue"
      icon={<Spinner aria-hidden size="sm" />}
      variant="outline"
    >
      {labelText}
    </Label>
  );
};

export default MountIsoUploadLabel;
