import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@openshift-console/dynamic-plugin-sdk-internal/node_modules/@patternfly/react-core';
import { TextInput } from '@patternfly/react-core';

import { diskReducerActions } from '../../reducer/actions';
import { DiskFormState } from '../../reducer/initialState';
import { sourceTypes } from '../utils/constants';

import DiskSizeNumberInput from './DiskSizeNumberInput';

type DiskSizeInputProps = {
  diskState: DiskFormState;
  dispatch: React.Dispatch<any>;
};

const DiskSizeInput: React.FC<DiskSizeInputProps> = ({ diskState, dispatch }) => {
  const { t } = useKubevirtTranslation();
  const { diskSource, diskSize } = diskState || {};
  const dynamicSize = t('Dynamic');

  const onChange = React.useCallback(
    (value: string) => {
      dispatch({ type: diskReducerActions.SET_DISK_SIZE, payload: value });
    },
    [dispatch],
  );

  if (sourceTypes.PVC === diskSource) {
    return null;
  }

  if (sourceTypes.EPHEMERAL === diskSource) {
    return (
      <FormGroup fieldId="ephemeral-disk-size" label="Size">
        <TextInput id="ephemeral-disk-size" type="text" value={dynamicSize} isDisabled />
      </FormGroup>
    );
  }

  return <DiskSizeNumberInput quantity={diskSize} onChange={onChange} />;
};

export default DiskSizeInput;
