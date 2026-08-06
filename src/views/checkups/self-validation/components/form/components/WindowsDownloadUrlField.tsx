import React, { FC, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { MAX_WIN_IMAGE_DOWNLOAD_URL_LENGTH } from '../../../utils/constants';
import { isValidWinImageDownloadUrl } from '../utils';

type WindowsDownloadUrlFieldProps = {
  setWinImageDownloadUrl: (url: string) => void;
  winImageDownloadUrl: string;
};

const WIN_IMAGE_DOWNLOAD_URL_HELPER_ID = 'win-image-download-url-helper';

const WindowsDownloadUrlField: FC<WindowsDownloadUrlFieldProps> = ({
  setWinImageDownloadUrl,
  winImageDownloadUrl,
}) => {
  const { t } = useKubevirtTranslation();
  const [isInvalid, setIsInvalid] = useState(false);

  const validated = isInvalid ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup fieldId="win-image-download-url" label={t('Windows image download URL')}>
      <TextInput
        aria-describedby={WIN_IMAGE_DOWNLOAD_URL_HELPER_ID}
        data-test="win-image-download-url-input"
        id="win-image-download-url"
        maxLength={MAX_WIN_IMAGE_DOWNLOAD_URL_LENGTH}
        name="win-image-download-url"
        onBlur={() => setIsInvalid(!isValidWinImageDownloadUrl(winImageDownloadUrl))}
        onChange={(_event, value) => {
          setIsInvalid(false);
          setWinImageDownloadUrl(value);
        }}
        type="url"
        validated={validated}
        value={winImageDownloadUrl}
      />
      <div id={WIN_IMAGE_DOWNLOAD_URL_HELPER_ID}>
        <FormGroupHelperText validated={validated}>
          {isInvalid
            ? t('Enter a valid http or https URL, or leave empty to use the default Windows ISO.')
            : t(
                'Leave empty to use the default Windows ISO URL, or enter a custom URL for disconnected environments.',
              )}
        </FormGroupHelperText>
      </div>
    </FormGroup>
  );
};

export default WindowsDownloadUrlField;
