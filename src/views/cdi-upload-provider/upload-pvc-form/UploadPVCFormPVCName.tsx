import React, { ReactEventHandler } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type UploadPVCFormPVCNameProps = {
  pvcName: string;
  handlePvcName: ReactEventHandler<HTMLInputElement>;
  isGolden: boolean;
  isLoading: boolean;
};

const UploadPVCFormPVCName: React.FC<UploadPVCFormPVCNameProps> = ({
  pvcName,
  handlePvcName,
  isGolden,
  isLoading,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <label className="control-label co-required" htmlFor="pvc-name">
        {t('Persistent Volume Claim Name')}
      </label>
      <div className="form-group">
        <input
          disabled={isGolden || isLoading}
          className="pf-c-form-control"
          type="text"
          onChange={handlePvcName}
          placeholder={isGolden ? t('pick an operating system') : t('my-storage-claim')}
          aria-describedby="pvc-name-help"
          id="pvc-name"
          value={pvcName || ''}
          required
        />
        <p className="help-block" id="pvc-name-help">
          {t('A unique name for the storage claim within the project')}
        </p>
      </div>
    </>
  );
};

export default UploadPVCFormPVCName;
