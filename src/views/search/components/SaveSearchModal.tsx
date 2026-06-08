import React, { FC, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type SaveSearchInputs = {
  description: string;
  name: string;
};

type SaveSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  onSubmit: (inputs: SaveSearchInputs) => void;
  savedSearchNames: string[];
};

const SaveSearchModal: FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  savedSearchNames,
}) => {
  const { t } = useKubevirtTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isNameEmpty = !name.trim();
  const invalidName = !isNameEmpty && savedSearchNames.includes(name);

  return (
    <TabModal
      onSubmit={async () => {
        onSubmit({ description, name });
      }}
      headerText={t('Save search')}
      isDisabled={isNameEmpty || invalidName}
      isOpen={isOpen}
      obj={{ metadata: { name } }}
      onClose={onClose}
      shouldWrapInForm
    >
      <FormGroup fieldId="save-search-name" label={t('Name')}>
        <TextInput
          data-test="save-search-name"
          id="save-search-name"
          onChange={(_, value) => setName(value)}
          type="text"
          value={name}
        />

        {invalidName && (
          <FormGroupHelperText validated={ValidatedOptions.error}>
            {t('A saved search with this name already exists. Please choose a different name.')}
          </FormGroupHelperText>
        )}
      </FormGroup>
      <FormGroup fieldId="save-search-description" label={t('Description')}>
        <TextInput
          data-test="save-search-description"
          id="save-search-description"
          onChange={(_, value) => setDescription(value)}
          type="text"
          value={description}
        />
      </FormGroup>
    </TabModal>
  );
};

export default SaveSearchModal;
