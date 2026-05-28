import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getVmUploadKeyFromVm,
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
  const vmKey = getVmUploadKeyFromVm(vm);
  const upload = useMountIsoUploadStore((state) => state.uploads[vmKey]);

  if (upload?.status !== UPLOAD_ALERT_STATUS.UPLOADING || upload.cdromDiskName !== diskName) {
    return null;
  }

  return (
    <Label color="blue" icon={<Spinner size="sm" />} variant="outline">
      {t('Upload in progress')}
    </Label>
  );
};

export default MountIsoUploadLabel;
