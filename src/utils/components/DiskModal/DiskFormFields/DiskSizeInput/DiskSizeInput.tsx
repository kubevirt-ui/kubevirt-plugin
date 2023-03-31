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
  const { diskSource, diskSize } = diskState || {};
  const dynamicSize = t(DYNAMIC);

  const onChange = React.useCallback(
    (value: string) => {
      dispatchDiskState({ type: diskReducerActions.SET_DISK_SIZE, payload: value });
    },
    [dispatchDiskState],
  );

  if (sourceTypes.PVC === diskSource || OTHER === diskSource) {
    return null;
  }

  if (sourceTypes.EPHEMERAL === diskSource) {
    return (
      <FormGroup fieldId="ephemeral-disk-size" label="Size">
        <TextInput id="ephemeral-disk-size" type="text" value={dynamicSize} isDisabled />
      </FormGroup>
    );
  }

  return (
    <CapacityInput size={diskSize} onChange={onChange} label={t('PersistentVolumeClaim size')} />
  );
};

export default DiskSizeInput;
