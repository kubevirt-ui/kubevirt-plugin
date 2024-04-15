import React, { FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

import { diskSourcePVCNamespaceFieldID } from '../../utils/constants';

type DiskSourcePVCSelectNamespaceProps = {
  vmNamespace?: string;
};

const DiskSourcePVCSelectNamespace: FC<DiskSourcePVCSelectNamespaceProps> = ({ vmNamespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      fieldId={diskSourcePVCNamespaceFieldID}
      id={diskSourcePVCNamespaceFieldID}
      label={t('PersistentVolumeClaim project')}
    >
      <FormPFSelect
        toggleProps={{
          isDisabled: true,
          isFullWidth: true,
          placeholder: vmNamespace,
        }}
      />
      <FormGroupHelperText>{t('Location of the existing PVC')}</FormGroupHelperText>
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
