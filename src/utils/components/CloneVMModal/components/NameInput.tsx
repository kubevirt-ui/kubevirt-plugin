import React, { Dispatch, FC, SetStateAction } from 'react';
import { Trans } from 'react-i18next';

import TabToConfirmTextInput from '@kubevirt-utils/components/TabToConfirmTextInput/TabToConfirmTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type NameInputProps = {
  autoFocus?: boolean;
  name: string;
  onConfirm: () => void;
  setName: Dispatch<SetStateAction<string>>;
};

const NameInput: FC<NameInputProps> = ({ autoFocus, name, onConfirm, setName }) => {
  const { t } = useKubevirtTranslation();
  return (
    <TabToConfirmTextInput
      helperText={
        <Trans t={t}>
          Click <strong>Tab</strong> to accept the suggested name, or edit it to enable the{' '}
          <strong>Clone</strong> button.
        </Trans>
      }
      autoFocus={autoFocus}
      fieldId="name"
      isRequired
      label={t('Name')}
      onChange={setName}
      onConfirm={onConfirm}
      value={name}
    />
  );
};

export default NameInput;
