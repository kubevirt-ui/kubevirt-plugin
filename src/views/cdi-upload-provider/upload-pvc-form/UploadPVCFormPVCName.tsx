import React, { ReactEventHandler } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, FormHelperText, HelperText, TextInput } from '@patternfly/react-core';

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
    <FormGroup fieldId="pvc-name" isRequired label={t('Persistent Volume Claim Name')}>
      <TextInput
        aria-describedby="pvc-name-help"
        id="pvc-name"
        isDisabled={isGolden || isLoading}
        onChange={handlePvcName}
        placeholder={isGolden ? t('pick an operating system') : t('my-storage-claim')}
        required
        type="text"
        value={pvcName || ''}
      />
      <FormHelperText>
        <HelperText id="pvc-name-help">
          {t('A unique name for the storage claim within the project')}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default UploadPVCFormPVCName;
