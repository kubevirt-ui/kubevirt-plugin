import { type FC, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { type ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Checkbox,
  Flex,
  FormGroup,
  TextArea,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { OutlinedStarIcon, StarIcon } from '@patternfly/react-icons';

type SaveSearchInputs = {
  description: string;
  isFavorited: boolean;
  name: string;
};

type SaveSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  initialDescription?: string;
  onSubmit: (inputs: SaveSearchInputs) => void;
  savedSearchNames: string[];
};

const SaveSearchModal: FC<SaveSearchModalProps> = ({
  initialDescription,
  isOpen,
  onClose,
  onSubmit,
  savedSearchNames,
}) => {
  const { t } = useKubevirtTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState(initialDescription ?? '');
  const [isFavorited, setIsFavorited] = useState(false);

  const trimmedName = name.trim();
  const isNameEmpty = !trimmedName;
  const invalidName = !isNameEmpty && savedSearchNames.includes(trimmedName);

  return (
    <TabModal
      headerText={t('Save search')}
      isDisabled={isNameEmpty || invalidName}
      isOpen={isOpen}
      obj={{ metadata: { name } }}
      onClose={onClose}
      onSubmit={async () => {
        onSubmit({ description, isFavorited, name: trimmedName });
      }}
      shouldWrapInForm
    >
      <FormGroup fieldId="save-search-name" isRequired label={t('Name')}>
        <TextInput
          data-test="save-search-name"
          id="save-search-name"
          onChange={(_event, value) => setName(value)}
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
        <TextArea
          data-test="save-search-description"
          id="save-search-description"
          onChange={(_event, value) => setDescription(value)}
          resizeOrientation="vertical"
          value={description}
        />
      </FormGroup>
      <Checkbox
        id="save-search-favorite"
        isChecked={isFavorited}
        label={
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <span>{t('Add to favorites')}</span>
            {isFavorited ? (
              <StarIcon color="var(--pf-t--global--color--status--warning--default)" />
            ) : (
              <OutlinedStarIcon />
            )}
          </Flex>
        }
        onChange={(_event, checked) => setIsFavorited(checked)}
      />
    </TabModal>
  );
};

export default SaveSearchModal;
