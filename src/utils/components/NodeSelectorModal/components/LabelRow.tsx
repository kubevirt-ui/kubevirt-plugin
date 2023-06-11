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
        <FormGroup fieldId={`label-${id}-key-input`} label={t('Key')}>
          <TextInput
            aria-label={t('selector key')}
            id={`label-${id}-key-input`}
            isRequired
            onChange={(newKey) => onChange({ ...label, key: newKey })}
            placeholder={t('Key')}
            type="text"
            value={key}
          />
        </FormGroup>
      </GridItem>
      <GridItem span={5}>
        <FormGroup fieldId={`label-${id}-value-input`} label={t('Value')}>
          <TextInput
            aria-label={t('selector value')}
            id={`label-${id}-value-input`}
            isRequired
            onChange={(newValue) => onChange({ ...label, value: newValue })}
            placeholder={t('Value')}
            type="text"
            value={value}
          />
        </FormGroup>
      </GridItem>
      <PlainIconButton
        fieldId={`label-${id}-delete-btn`}
        icon={<MinusCircleIcon />}
        onClick={() => onDelete(id)}
      />
    </>
  );
};

export default LabelRow;
