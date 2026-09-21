import { type Dispatch, type FC, type SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup } from '@patternfly/react-core';

import SysprepSelectionRadioGroup from '../SysprepSelectionRadioGroup';

import SelectSysprep from '../../SelectSysprep';
import Sysprep from '../../Sysprep';
import { SysprepSelectionOption } from '../../types';

import './SysprepModalBody.scss';

type SysprepModalBodyProps = {
  autoUnattend: string;
  canCreateConfigMap: boolean;
  cluster?: string;
  namespace: string;
  selectedSysprepName: string;
  selectionOption: SysprepSelectionOption;
  setAutoUnattend: Dispatch<SetStateAction<string>>;
  setSelectedSysprepName: Dispatch<SetStateAction<string>>;
  setSelectionOption: Dispatch<SetStateAction<SysprepSelectionOption>>;
  setUnattend: Dispatch<SetStateAction<string>>;
  unattend: string;
};

const SysprepModalBody: FC<SysprepModalBodyProps> = ({
  autoUnattend,
  canCreateConfigMap,
  cluster,
  namespace,
  selectedSysprepName,
  selectionOption,
  setAutoUnattend,
  setSelectedSysprepName,
  setSelectionOption,
  setUnattend,
  unattend,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <SysprepSelectionRadioGroup
        canCreateConfigMap={canCreateConfigMap}
        selectedOption={selectionOption}
        setSelectedOption={setSelectionOption}
      />
      {selectionOption === SysprepSelectionOption.UseExisting && (
        <Form>
          <FormGroup
            className="sysprep-modal-section__form-group"
            fieldId="select-sysprep"
            label={t('Sysprep')}
          >
            <SelectSysprep
              cluster={cluster}
              id="select-sysprep"
              namespace={namespace}
              onSelectSysprep={setSelectedSysprepName}
              selectedSysprepName={selectedSysprepName}
            />
          </FormGroup>
        </Form>
      )}
      {selectionOption === SysprepSelectionOption.CreateNew && (
        <Sysprep
          autoUnattend={autoUnattend}
          onAutoUnattendChange={setAutoUnattend}
          onUnattendChange={setUnattend}
          showInfo={false}
          unattend={unattend}
        />
      )}
    </>
  );
};

export default SysprepModalBody;
