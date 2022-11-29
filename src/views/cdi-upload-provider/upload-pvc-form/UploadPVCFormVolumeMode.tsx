import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import {
  AccessMode,
  getVolumeModeForProvisioner,
  getVolumeModeRadioOptions,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/modesMapping';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

type UploadPVCFormModeVolumeModeVolumeModeProps = {
  accessMode: AccessMode;
  onChange: (volumeMode: string) => void;
  provisioner: string;
  storageClass: string;
  loaded: boolean;
  volumeMode: string;
};

const UploadPVCFormModeVolumeMode: React.FC<UploadPVCFormModeVolumeModeVolumeModeProps> = ({
  accessMode,
  onChange,
  provisioner,
  storageClass,
  loaded,
  volumeMode,
}) => {
  const { t } = useKubevirtTranslation();

  const allowedVolumeModes: string[] = useMemo(
    () => (loaded ? getVolumeModeForProvisioner(provisioner, accessMode) : []),
    [loaded, provisioner, accessMode],
  );

  return (
    <FormGroup fieldId="volume-mode" label={t('Volume mode')} isRequired>
      {allowedVolumeModes?.length === 1 ? (
        <>
          {allowedVolumeModes?.[0]}

          <Trans t={t} ns="plugin__kubevirt-plugin">
            Only {{ volumeMode }} volume mode is available for {{ storageClass }} with{' '}
            {{ accessMode }} access mode
          </Trans>
        </>
      ) : (
        getVolumeModeRadioOptions(t).map(({ value, label }) => (
          <Radio
            value={value}
            label={label}
            id={value}
            key={value}
            onChange={(_, event) => onChange(event?.currentTarget?.value)}
            checked={value === volumeMode}
            name="volumeMode"
            isDisabled={!allowedVolumeModes?.includes(value)}
          />
        ))
      )}
    </FormGroup>
  );
};

export default UploadPVCFormModeVolumeMode;
