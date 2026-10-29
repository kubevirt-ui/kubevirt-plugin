import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { UPLOAD_PROGRESS_STATUS } from '@kubevirt-utils/hooks/useInFlightToast/constants';
import { useInFlightToastStore } from '@kubevirt-utils/hooks/useInFlightToast/inFlightToastStore';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useInFlightToast/keys/uploadKeys';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Spinner } from '@patternfly/react-core';

type MountIsoUploadLabelProps = {
  diskName: string;
  vm: V1VirtualMachine;
};

const MountIsoUploadLabel: FC<MountIsoUploadLabelProps> = ({ diskName, vm }) => {
  const { t } = useKubevirtTranslation();
  const uploadKey = getVmCdromUploadKeyFromVm(vm, diskName);
  const upload = useInFlightToastStore((state) => state.uploads.actions?.getUpload?.(uploadKey));

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
