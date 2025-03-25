import React, { FC, useState, useCallback } from 'react';
import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import ProjectDropdown, {
  ProjectDropdownProps,
} from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Form,
  FormGroup,
  TextInput,
  TextInputProps,
  Button,
} from '@patternfly/react-core';

export type AdvancedSearchInputs = Partial<{
  name: string;
  namespace: string;
  description: string;
}>;

type AdvancedSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  onSubmit: (searchInputs: Required<AdvancedSearchInputs>) => void;
  prefillInputs?: AdvancedSearchInputs;
};

const AdvancedSearchModal: FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillInputs = {},
}) => {
  const { t } = useKubevirtTranslation();

  const [name, setName] = useState(prefillInputs.name ?? '');
  const [namespace, setNamespace] = useState(prefillInputs.namespace ?? '');
  const [description, setDescription] = useState(prefillInputs.description ?? '');

  const onNameChange = useCallback<TextInputProps['onChange']>(
    (_, value) => {
      setName(value);
    },
    [setName],
  );

  const onNamespaceChange = useCallback<ProjectDropdownProps['onChange']>(
    (project) => {
      setNamespace(project);
    },
    [setNamespace],
  );

  const onDescriptionChange = useCallback<TextInputProps['onChange']>(
    (_, value) => {
      setDescription(value);
    },
    [setDescription],
  );

  const resetForm = useCallback(() => {
    setName('');
    setNamespace('');
    setDescription('');
  }, [setName, setNamespace, setDescription]);

  const submitForm = useCallback(() => {
    onSubmit({
      name,
      namespace,
      description,
    });
  }, [onSubmit, name, namespace, description]);

  const closeModal = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal
      className="ocs-modal co-catalog-page__overlay"
      position="top"
      variant="medium"
      isOpen={isOpen}
      onClose={closeModal}
    >
      <ModalHeader title={t('Advanced search')} />
      <ModalBody>
        <Form>
          <FormGroup label={t('Name')}>
            <TextInput type="text" value={name} onChange={onNameChange} />
          </FormGroup>
          <FormGroup label={t('Project')}>
            <ProjectDropdown
              includeAllProjects={false}
              selectedProject={namespace}
              onChange={onNamespaceChange}
            />
          </FormGroup>
          <FormGroup label={t('Description')}>
            <TextInput type="text" value={description} onChange={onDescriptionChange} />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={submitForm}>
          {t('Search')}
        </Button>
        <Button variant="secondary" onClick={resetForm}>
          {t('Reset')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdvancedSearchModal;
