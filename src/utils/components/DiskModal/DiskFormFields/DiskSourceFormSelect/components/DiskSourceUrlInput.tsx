import React, { FC, useMemo } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_IMAGE_LINKS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { getURLSourceHelpertText } from '../../utils/helpers';
import { HTTP_URL_PREFIX, HTTPS_URL_PREFIX } from '../utils/constants';

const URLSourceHelperText: FC<{ os: OS_NAME_TYPES }> = ({ os }) => {
  const { afterLabelText, beforeLabelText, label } = getURLSourceHelpertText(os);
  return (
    <>
      {beforeLabelText}
      <strong>
        <a href={OS_IMAGE_LINKS[os || OS_NAME_TYPES.fedora]} rel="noreferrer" target="_blank">
          {label}
        </a>
      </strong>
      {afterLabelText}
    </>
  );
};

type DiskSourceUrlInputProps = {
  onChange: (value: string) => void;
  os: string;
  url: string;
};

const DiskSourceUrlInput: FC<DiskSourceUrlInputProps> = ({ onChange, os, url }) => {
  const { t } = useKubevirtTranslation();

  const isValidURL = useMemo(() => {
    if (!url) {
      return true;
    }

    return url?.startsWith(HTTP_URL_PREFIX) || url?.startsWith(HTTPS_URL_PREFIX);
  }, [url]);

  return (
    <FormGroup fieldId="disk-source-url" isRequired label={t('URL')}>
      <TextInput
        data-test-id="disk-source-url"
        id="disk-source-url"
        onChange={(_, value: string) => onChange(value)}
        type="text"
        value={url}
      />
      <FormGroupHelperText
        validated={isValidURL ? ValidatedOptions.default : ValidatedOptions.error}
      >
        {isValidURL ? (
          <URLSourceHelperText os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]} />
        ) : (
          t('Invalid URL')
        )}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default DiskSourceUrlInput;
