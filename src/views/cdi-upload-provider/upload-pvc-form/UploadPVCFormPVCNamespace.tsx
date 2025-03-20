import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, FormHelperText, HelperText, TextInput } from '@patternfly/react-core';

type UploadPVCFormPVCNamespaceProps = { namespace: string };

const UploadPVCFormPVCNamespace: React.FC<UploadPVCFormPVCNamespaceProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="pvc-namespace" isRequired label={t('Namespace')}>
      <TextInput
        aria-describedby="pvc-namespace-help"
        id="pvc-namespace"
        isDisabled
        required
        type="text"
        value={namespace || ''}
      />
      <FormHelperText>
        <HelperText id="pvc-namespace-help">
          {t('A unique namespace for the storage claim within the project')}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default UploadPVCFormPVCNamespace;
