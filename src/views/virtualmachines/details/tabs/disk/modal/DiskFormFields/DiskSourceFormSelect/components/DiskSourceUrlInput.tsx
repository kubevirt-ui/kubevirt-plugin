import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_IMAGE_LINKS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { getURLSourceHelpertText } from '../../utils/helpers';

const URLSourceHelperText: React.FC<{ os: OS_NAME_TYPES }> = ({ os }) => {
  const { t } = useKubevirtTranslation();
  const { beforeLabelText, label, afterLabelText } = getURLSourceHelpertText(t, os);
  return (
    <>
      {beforeLabelText}
      <strong>
        <a href={OS_IMAGE_LINKS[os]} target="_blank" rel="noreferrer">
          {label}
        </a>
      </strong>
      {afterLabelText}
    </>
  );
};

type DiskSourceUrlInputProps = {
  url: string;
  onChange: (value: string) => void;
  os: string;
};

const DiskSourceUrlInput: React.FC<DiskSourceUrlInputProps> = ({ url, onChange, os }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      helperText={<URLSourceHelperText os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]} />}
      label={t('URL')}
      fieldId="disk-source-url"
      isRequired
    >
      <TextInput id="disk-source-url" type="text" value={url} onChange={onChange} />
    </FormGroup>
  );
};

export default DiskSourceUrlInput;
