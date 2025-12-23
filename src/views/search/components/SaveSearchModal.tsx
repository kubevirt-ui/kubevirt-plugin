import React, { FC, useMemo, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { useSavedSearchData } from '@search/hooks/useSavedSearchData';

type SaveSearchInputs = {
  description: string;
  name: string;
};

type SaveSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  onSubmit: (inputs: SaveSearchInputs) => void;
};

const SaveSearchModal: FC<SaveSearchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useKubevirtTranslation();

  const { searches } = useSavedSearchData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isEmptyForm = useMemo<boolean>(
    () => name === '' && description === '',
    [name, description],
  );

  const submitForm = () => {
    onSubmit({
      description,
      name,
    });
  };

  const invalidName = searches?.some((search) => search.name === name);

  return (
    <Modal
      className="ocs-modal co-catalog-page__overlay"
      isOpen={isOpen}
      onClose={onClose}
      position="top"
      variant="medium"
    >
      <ModalHeader title={t('Save search')} />
      <ModalBody>
        <Form>
          <FormGroup label={t('Name')}>
            <TextInput
              data-test-id="save-search-name"
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
          <FormGroup label={t('Description')}>
            <TextInput
              data-test-id="save-search-description"
              onChange={(_, value) => setDescription(value)}
              type="text"
              value={description}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          data-test="save-button"
          isDisabled={isEmptyForm || invalidName}
          onClick={submitForm}
          variant="primary"
        >
          {t('Save')}
        </Button>
        <Button data-test="cancel-button" onClick={onClose} variant="secondary">
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SaveSearchModal;
