import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_IMAGE_LINKS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import { getURLSourceHelpertText } from '../../utils/helpers';
import { HTTP_URL_PREFIX, HTTPS_URL_PREFIX } from '../utils/constants';

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

  const isValidURL = React.useMemo(() => {
    if (!url) {
      return true;
    } else {
      return url?.startsWith(HTTP_URL_PREFIX) || url?.startsWith(HTTPS_URL_PREFIX);
    }
  }, [url]);

  return (
    <FormGroup
      helperText={<URLSourceHelperText os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]} />}
      label={t('URL')}
      fieldId="disk-source-url"
      isRequired
      helperTextInvalid={!isValidURL && t('Invalid URL')}
      helperTextInvalidIcon={<ExclamationCircleIcon />}
      validated={isValidURL ? ValidatedOptions.default : ValidatedOptions.error}
    >
      <TextInput
        data-test-id="disk-source-url"
        id="disk-source-url"
        type="text"
        value={url}
        onChange={onChange}
      />
    </FormGroup>
  );
};

export default DiskSourceUrlInput;
