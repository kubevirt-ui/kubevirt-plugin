import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { InitialMigrationPolicyState } from '../../list/components/MigrationPolicyCreateForm/utils/utils';
import {
  EditMigrationPolicyInitialState,
  MigrationPolicyStateDispatch,
} from '../MigrationPolicyEditModal/utils/constants';

import BandwidthInput from './BandwidthInput/BandwidthInput';
import CompletionTimeoutInput from './CompletionTimeoutInput/CompletionTimeoutInput';

type MigrationPolicyConfigurationsFormGroupProps = {
  state: EditMigrationPolicyInitialState | InitialMigrationPolicyState;
  setStateField: (
    field: string,
  ) => React.Dispatch<React.SetStateAction<MigrationPolicyStateDispatch>>;
};

const MigrationPolicyConfigurationsFormGroup: React.FC<
  MigrationPolicyConfigurationsFormGroupProps
> = ({ state, setStateField }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <FormGroup
        fieldId="migration-policy-bandwidth"
        label={t('Bandwidth consumption')}
        helperText={t('To gain unlimited bandwidth, set to 0')}
      >
        <BandwidthInput
          bandwidth={state?.bandwidthPerMigration}
          setBandwidth={setStateField('bandwidthPerMigration')}
        />
      </FormGroup>
      <Checkbox
        isChecked={state?.autoConverge}
        onChange={(checked) => {
          const setAutoConverge = setStateField('autoConverge');
          setAutoConverge(checked);
          if (checked) {
            const setCompletionTimeoutEnabled = setStateField('completionTimeout');
            setCompletionTimeoutEnabled((prev: { enabled: boolean; value: number }) => ({
              ...prev,
              enabled: checked,
            }));
          }
        }}
        label={<div className="pf-c-form__label">{t('Enable auto converge')}</div>}
        id="migration-policy-auto-converge"
        data-test-id="migration-policy-auto-converge"
      />
      <Checkbox
        isChecked={state?.postCopy}
        onChange={setStateField('postCopy')}
        label={<div className="pf-c-form__label">{t('Enable post-copy')}</div>}
        id="migration-policy-post-copy"
        data-test-id="migration-policy-post-copy"
      />
      <FormGroup fieldId="migration-policy-completion-timeout">
        <CompletionTimeoutInput
          completionTimeout={state?.completionTimeout}
          setCompletionTimeout={setStateField('completionTimeout')}
        />
      </FormGroup>
    </>
  );
};

export default MigrationPolicyConfigurationsFormGroup;
