import * as React from 'react';

import PlainIconButton from '@kubevirt-utils/components/HardwareDevices/form/PlainIconButton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { IDLabel } from '../utils/types';

type LabelRowProps = {
  label: IDLabel;
  onChange: (label: IDLabel) => void;
  onDelete: (id: any) => void;
};

const LabelRow: React.FC<LabelRowProps> = ({ label, onChange, onDelete }) => {
  const { t } = useKubevirtTranslation();
  const { id, key, value } = label;
  return (
    <>
      <GridItem span={6}>
        <FormGroup label={t('Key')} fieldId={`label-${id}-key-input`}>
          <TextInput
            id={`label-${id}-key-input`}
            placeholder={t('Key')}
            isRequired
            type="text"
            value={key}
            onChange={(newKey) => onChange({ ...label, key: newKey })}
            aria-label={t('selector key')}
          />
        </FormGroup>
      </GridItem>
      <GridItem span={5}>
        <FormGroup label={t('Value')} fieldId={`label-${id}-value-input`}>
          <TextInput
            id={`label-${id}-value-input`}
            placeholder={t('Value')}
            isRequired
            type="text"
            value={value}
            onChange={(newValue) => onChange({ ...label, value: newValue })}
            aria-label={t('selector value')}
          />
        </FormGroup>
      </GridItem>
      <PlainIconButton
        fieldId={`label-${id}-delete-btn`}
        onClick={() => onDelete(id)}
        icon={<MinusCircleIcon />}
      />
    </>
  );
};

export default LabelRow;
