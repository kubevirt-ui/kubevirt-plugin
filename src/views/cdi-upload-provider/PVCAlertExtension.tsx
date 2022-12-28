import React, { useContext } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { UPLOAD_STATUS } from './utils/consts';
import { CDIUploadContext } from './utils/context';

type PVCAlertExtension = {
  pvc: K8sResourceCommon;
};

const PVCAlertExtension: React.FC<PVCAlertExtension> = ({ pvc }) => {
  const { uploads } = useContext(CDIUploadContext);
  const { t } = useKubevirtTranslation();
  const isUploading = uploads?.find(
    (upl) =>
      upl?.pvcName === pvc?.metadata?.name &&
      upl?.namespace === pvc?.metadata?.namespace &&
      upl?.uploadStatus === UPLOAD_STATUS.UPLOADING,
  );

  return isUploading ? (
    <Alert
      className="co-m-form-row"
      isInline
      variant={AlertVariant.warning}
      title={t("Please don't close this browser tab")}
    >
      {t('Closing it will cause the upload to fail. You may still navigate the console.')}
    </Alert>
  ) : null;
};

export default PVCAlertExtension;
