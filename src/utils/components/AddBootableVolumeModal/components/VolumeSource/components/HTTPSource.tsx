import React, { FC } from 'react';

import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type HTTPSourceProps = {
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const HTTPSource: FC<HTTPSourceProps> = ({ setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const httpSourceHelperURL =
    'https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2';

  return (
    <FormGroup className="disk-source-form-group" isRequired label={t('Image URL')}>
      <FormTextInput
        aria-label={t('Image URL')}
        onChange={(event) => setBootableVolumeField('url')(event.currentTarget.value)}
        type="text"
      />
      <FormGroupHelperText>
        <>
          {t('Enter URL to download. For example: ')}
          <a href={httpSourceHelperURL} rel="noreferrer" target="_blank">
            {httpSourceHelperURL}
          </a>
        </>
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default HTTPSource;
