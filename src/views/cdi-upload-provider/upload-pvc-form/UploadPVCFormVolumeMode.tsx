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
  loaded: boolean;
  onChange: (volumeMode: string) => void;
  provisioner: string;
  storageClass: string;
  volumeMode: string;
};

const UploadPVCFormModeVolumeMode: React.FC<UploadPVCFormModeVolumeModeVolumeModeProps> = ({
  accessMode,
  loaded,
  onChange,
  provisioner,
  storageClass,
  volumeMode,
}) => {
  const { t } = useKubevirtTranslation();

  const allowedVolumeModes: string[] = useMemo(
    () => (loaded ? getVolumeModeForProvisioner(provisioner, accessMode) : []),
    [loaded, provisioner, accessMode],
  );

  return (
    <FormGroup fieldId="volume-mode" isRequired label={t('Volume mode')}>
      {allowedVolumeModes?.length === 1 ? (
        <>
          {allowedVolumeModes?.[0]}

          <Trans ns="plugin__kubevirt-plugin" t={t}>
            Only {{ volumeMode }} volume mode is available for {{ storageClass }} with{' '}
            {{ accessMode }} access mode
          </Trans>
        </>
      ) : (
        getVolumeModeRadioOptions(t).map(({ label, value }) => (
          <Radio
            checked={value === volumeMode}
            id={value}
            isDisabled={!allowedVolumeModes?.includes(value)}
            key={value}
            label={label}
            name="volumeMode"
            onChange={(_, event) => onChange(event?.currentTarget?.value)}
            value={value}
          />
        ))
      )}
    </FormGroup>
  );
};

export default UploadPVCFormModeVolumeMode;
