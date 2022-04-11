import * as React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Divider, FormGroup } from '@patternfly/react-core';

import BootCDCheckbox from './BootCDCheckboxLabel';
import {
  BLANK_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  UPLOAD_SOURCE_NAME,
} from './constants';
import { SelectCDSourceLabel } from './SelectCDSourceLabel';
import { SelectDiskSourceLabel } from './SelectDiskSourceLabel';
import { SelectSource } from './SelectSource';
import { getPVCSource } from './utils';

import './CustomizeSource.scss';

export type CustomizeSourceProps = {
  setDiskSource: (customSource: V1beta1DataVolumeSpec | undefined) => void;
  initialVolumeQuantity?: string;
  withDrivers: boolean;
  setDrivers: (withDrivers: boolean) => void;
  cdSource: V1beta1DataVolumeSpec | undefined;
  setCDSource: (cdSource: V1beta1DataVolumeSpec | undefined) => void;
};

export const CustomizeSource: React.FC<CustomizeSourceProps> = ({
  setDiskSource,
  initialVolumeQuantity,
  withDrivers,
  setDrivers,
  cdSource,
  setCDSource,
}) => {
  const { t } = useKubevirtTranslation();

  const onCDCheckboxChange = React.useCallback(() => {
    if (cdSource) setCDSource(undefined);
    else setCDSource(getPVCSource(null, null));
  }, [cdSource, setCDSource]);

  return (
    <div className="customize-source">
      <BootCDCheckbox onChange={onCDCheckboxChange} cdSource={cdSource} />

      {cdSource && (
        <SelectSource
          initialSourceType={PVC_SOURCE_NAME}
          onSourceChange={setCDSource}
          sourceLabel={<SelectCDSourceLabel />}
          sourceOptions={[
            PVC_SOURCE_NAME,
            CONTAINER_DISK_SOURCE_NAME,
            HTTP_SOURCE_NAME,
            UPLOAD_SOURCE_NAME,
          ]}
        />
      )}

      {cdSource && <Divider className="divider" />}
      <SelectSource
        initialVolumeQuantity={initialVolumeQuantity || '30Gi'}
        onSourceChange={setDiskSource}
        withSize
        sourceOptions={[
          DEFAULT_SOURCE,
          PVC_SOURCE_NAME,
          REGISTRY_SOURCE_NAME,
          HTTP_SOURCE_NAME,
          UPLOAD_SOURCE_NAME,
          BLANK_SOURCE_NAME,
        ]}
        sourceLabel={<SelectDiskSourceLabel />}
      />

      <FormGroup fieldId="customize-cdrom-drivers">
        <Checkbox
          isChecked={withDrivers}
          onChange={setDrivers}
          label={t('Mount Windows drivers disk')}
          id="cdrom-drivers"
        />
      </FormGroup>
    </div>
  );
};
