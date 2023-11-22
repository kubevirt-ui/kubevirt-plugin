import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import CapacityInput from '../../../CapacityInput/CapacityInput';
import { diskReducerActions, DiskReducerActionType } from '../../state/actions';
import { DiskFormState } from '../../state/initialState';
import { DYNAMIC, OTHER, sourceTypes } from '../utils/constants';

type DiskSizeInputProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
};

const DiskSizeInput: React.FC<DiskSizeInputProps> = ({ diskState, dispatchDiskState }) => {
  const { t } = useKubevirtTranslation();
  const { diskSize, diskSource } = diskState || {};
  const dynamicSize = t(DYNAMIC);

  const onChange = React.useCallback(
    (value: string) => {
      dispatchDiskState({ payload: value, type: diskReducerActions.SET_DISK_SIZE });
    },
    [dispatchDiskState],
  );

  if (sourceTypes.PVC === diskSource || OTHER === diskSource) {
    return null;
  }

  if (sourceTypes.EPHEMERAL === diskSource) {
    return (
      <FormGroup fieldId="ephemeral-disk-size" label="Size">
        <TextInput id="ephemeral-disk-size" isDisabled type="text" value={dynamicSize} />
      </FormGroup>
    );
  }

  return (
    <CapacityInput label={t('PersistentVolumeClaim size')} onChange={onChange} size={diskSize} />
  );
};

export default DiskSizeInput;
