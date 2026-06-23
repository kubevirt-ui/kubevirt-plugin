import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UPLOAD_PROGRESS_STATUS } from '@kubevirt-utils/hooks/useUploadProgressToast/constants';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useUploadProgressToast/keys/uploadKeys';
import { useUploadProgressStore } from '@kubevirt-utils/hooks/useUploadProgressToast/uploadProgressStore';
import { Label, Spinner } from '@patternfly/react-core';

type MountIsoUploadLabelProps = {
  diskName: string;
  vm: V1VirtualMachine;
};

const MountIsoUploadLabel: FC<MountIsoUploadLabelProps> = ({ diskName, vm }) => {
  const { t } = useKubevirtTranslation();
  const uploadKey = getVmCdromUploadKeyFromVm(vm, diskName);
  const upload = useUploadProgressStore((state) => state.uploads[uploadKey]);

  if (upload?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
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
