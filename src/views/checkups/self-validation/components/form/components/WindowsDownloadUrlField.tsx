import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  HelperText,
  HelperTextItem,
  StackItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';

import { getDownloadUrlDisabledMessage } from '../utils';

type WindowsDownloadUrlFieldProps = {
  isDownloadUrlDisabled: boolean;
  setWinImageDownloadUrl: (url: string) => void;
  showDownloadUrlTooltip: boolean;
  winImageDownloadUrl: string;
};

const WindowsDownloadUrlField: FC<WindowsDownloadUrlFieldProps> = ({
  isDownloadUrlDisabled,
  setWinImageDownloadUrl,
  showDownloadUrlTooltip,
  winImageDownloadUrl,
}) => {
  const { t } = useKubevirtTranslation();

  const disabledMessage = getDownloadUrlDisabledMessage(t);

  return (
    <StackItem className="pf-v6-u-pl-lg">
      <FormGroup
        className="form-group-spacing"
        fieldId="win-image-download-url"
        label={t('Windows image download URL')}
      >
        <Tooltip
          content={disabledMessage}
          trigger={showDownloadUrlTooltip ? 'mouseenter focus' : 'manual'}
        >
          <TextInput
            data-test="win-image-download-url-input"
            id="win-image-download-url"
            isDisabled={isDownloadUrlDisabled}
            name="win-image-download-url"
            onChange={(_event, value) => setWinImageDownloadUrl(value)}
            placeholder={isDownloadUrlDisabled ? disabledMessage : undefined}
            value={winImageDownloadUrl}
          />
        </Tooltip>
        <HelperText className="checkups-self-validation-form__helper-text">
          <HelperTextItem>
            {t(
              'Leave empty to use the default Windows ISO URL, or enter a custom URL for disconnected environments.',
            )}
          </HelperTextItem>
        </HelperText>
      </FormGroup>
    </StackItem>
  );
};

export default WindowsDownloadUrlField;
