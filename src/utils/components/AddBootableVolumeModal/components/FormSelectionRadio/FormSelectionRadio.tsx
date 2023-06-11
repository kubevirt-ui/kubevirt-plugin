import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem } from '@patternfly/react-core';

import { RADIO_FORM_SELECTION } from '../../utils/constants';

type FormSelectionRadioProps = {
  formSelection: RADIO_FORM_SELECTION;
  setFormSelection: React.Dispatch<React.SetStateAction<RADIO_FORM_SELECTION>>;
};

const FormSelectionRadio: FC<FormSelectionRadioProps> = ({ formSelection, setFormSelection }) => {
  return (
    <Split hasGutter>
      <SplitItem>
        <Radio
          id={RADIO_FORM_SELECTION.UPLOAD_IMAGE}
          isChecked={formSelection === RADIO_FORM_SELECTION.UPLOAD_IMAGE}
          label={t('Upload volume')}
          name="form-selection"
          onClick={() => setFormSelection(RADIO_FORM_SELECTION.UPLOAD_IMAGE)}
        />
      </SplitItem>
      <SplitItem>
        <Radio
          id={RADIO_FORM_SELECTION.USE_EXISTING_PVC}
          isChecked={formSelection === RADIO_FORM_SELECTION.USE_EXISTING_PVC}
          label={t('Use existing volume')}
          name="form-selection"
          onClick={() => setFormSelection(RADIO_FORM_SELECTION.USE_EXISTING_PVC)}
        />
      </SplitItem>
    </Split>
  );
};

export default FormSelectionRadio;
