import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type UploadPVCFormPVCNamespaceProps = { namespace: string };

const UploadPVCFormPVCNamespace: React.FC<UploadPVCFormPVCNamespaceProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <label className="control-label co-required" htmlFor="pvc-namespace">
        {t('Namespace')}
      </label>
      <div className="form-group">
        <input
          aria-describedby="pvc-namespace-help"
          className="pf-c-form-control"
          disabled
          id="pvc-namespace"
          required
          type="text"
          value={namespace || ''}
        />
        <p className="help-block" id="pvc-namespace-help">
          {t('A unique namespace for the storage claim within the project')}
        </p>
      </div>
    </>
  );
};

export default UploadPVCFormPVCNamespace;
