import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { OS_REGISTERY_LINKS } from '../../utils/constants';

type DiskSourceUrlInputProps = {
  url: string;
  onChange: (value: string) => void;
  os: string;
};

const DiskSourceContainer: React.FC<DiskSourceUrlInputProps> = ({ url, onChange, os }) => {
  const { t } = useKubevirtTranslation();
  const isUpstream = (window as any).SERVER_FLAGS.branding === 'okd';
  const isRHELOS = os?.includes(OS_NAME_TYPES.rhel);
  // we show feodra on upstream and rhel on downstream, and default as fedora if not exists.
  const exampleURL =
    isRHELOS && isUpstream
      ? OS_REGISTERY_LINKS.fedora
      : OS_REGISTERY_LINKS[os] || OS_REGISTERY_LINKS.fedora;

  return (
    <FormGroup
      helperText={
        <>
          {t('Example: ')}
          {exampleURL}
        </>
      }
      label={t('Container')}
      fieldId="disk-source-container"
      isRequired
    >
      <TextInput
        id="disk-source-container"
        type="text"
        value={url}
        onChange={onChange}
        data-test-id="disk-source-container"
      />
    </FormGroup>
  );
};

export default DiskSourceContainer;
