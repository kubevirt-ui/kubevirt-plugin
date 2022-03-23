import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_IMAGE_LINKS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { diskSourceReducerActions } from '../../../state/actions';
import { getURLSourceHelpertText } from '../../utils/helpers';

const URLSourceHelperText: React.FC<{ os: OS_NAME_TYPES }> = ({ os }) => {
  const { t } = useKubevirtTranslation();
  const { beforeLabelText, label, afterLabelText } = getURLSourceHelpertText(t, os);
  return (
    <>
      {beforeLabelText}
      <strong>
        <Link to={OS_IMAGE_LINKS[os]}>{label}</Link>
      </strong>
      {afterLabelText}
    </>
  );
};

type DiskSourceUrlInputProps = {
  url: string;
  dispatch: React.Dispatch<any>;
  os: string;
};

const DiskSourceUrlInput: React.FC<DiskSourceUrlInputProps> = ({ url, dispatch, os }) => {
  const { t } = useKubevirtTranslation();

  const onChange = React.useCallback(
    (value: string, event: React.FormEvent<HTMLInputElement>) => {
      event.preventDefault();
      dispatch({ type: diskSourceReducerActions.SET_URL_SOURCE, payload: value });
    },
    [dispatch],
  );
  return (
    <FormGroup
      helperText={<URLSourceHelperText os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]} />}
      label={t('URL')}
      fieldId="disk-source-url"
      isRequired
    >
      <TextInput id="disk-source-url" type="text" value={url} onChange={onChange} />
    </FormGroup>
  );
};

export default DiskSourceUrlInput;
