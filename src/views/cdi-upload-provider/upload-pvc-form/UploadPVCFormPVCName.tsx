import React, { ReactEventHandler } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type UploadPVCFormPVCNameProps = {
  handlePvcName: ReactEventHandler<HTMLInputElement>;
  isGolden: boolean;
  isLoading: boolean;
  pvcName: string;
};

const UploadPVCFormPVCName: React.FC<UploadPVCFormPVCNameProps> = ({
  handlePvcName,
  isGolden,
  isLoading,
  pvcName,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <label className="control-label co-required" htmlFor="pvc-name">
        {t('Persistent Volume Claim Name')}
      </label>
      <div className="form-group">
        <input
          aria-describedby="pvc-name-help"
          className="pf-c-form-control"
          disabled={isGolden || isLoading}
          id="pvc-name"
          onChange={handlePvcName}
          placeholder={isGolden ? t('pick an operating system') : t('my-storage-claim')}
          required
          type="text"
          value={pvcName || ''}
        />
        <p className="help-block" id="pvc-name-help">
          {t('A unique name for the storage claim within the project')}
        </p>
      </div>
    </>
  );
};

export default UploadPVCFormPVCName;
