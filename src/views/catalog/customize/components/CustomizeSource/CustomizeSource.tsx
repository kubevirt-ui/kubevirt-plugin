import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateImportURLs } from '@kubevirt-utils/resources/template';
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
import SelectCDSourcePopOver from './SelectCDSourcePopOver';
import SelectDiskSourcePopOver from './SelectDiskSourcePopOver';
import { SelectSource } from './SelectSource';
import {
  getGenericSourceCustomization,
  getPVCSource,
  getRegistryHelperText,
  getTemplateStorageQuantity,
} from './utils';

import './CustomizeSource.scss';

export type CustomizeSourceProps = {
  diskSource: V1beta1DataVolumeSpec;
  setDiskSource: (customSource: V1beta1DataVolumeSpec | undefined) => void;
  withDrivers: boolean;
  setDrivers: (withDrivers: boolean) => void;
  cdSource: V1beta1DataVolumeSpec | undefined;
  setCDSource: (cdSource: V1beta1DataVolumeSpec | undefined) => void;
  template: V1Template;
  diskUpload?: DataUpload;
  cdUpload?: DataUpload;
};

export const CustomizeSource: React.FC<CustomizeSourceProps> = ({
  diskSource,
  setDiskSource,
  withDrivers,
  setDrivers,
  cdSource,
  setCDSource,
  template,
  diskUpload,
  cdUpload,
}) => {
  const { t } = useKubevirtTranslation();
  const onCDCheckboxChange = React.useCallback(() => {
    if (cdSource) {
      setCDSource(undefined);
    } else {
      setDiskSource(getGenericSourceCustomization(BLANK_SOURCE_NAME));
      setCDSource(getPVCSource(null, null));
    }
  }, [cdSource, setCDSource, setDiskSource]);

  const httpSourceHelperURL = getTemplateImportURLs(template)?.[0];
  const registrySourceHelperText = getRegistryHelperText(template, t);

  return (
    <div className="customize-source">
      <BootCDCheckbox onChange={onCDCheckboxChange} cdSource={cdSource} />

      {cdSource && (
        <SelectSource
          selectedSource={cdSource}
          onSourceChange={setCDSource}
          sourceLabel={t('CD source')}
          sourcePopOver={<SelectCDSourcePopOver />}
          sourceOptions={[
            HTTP_SOURCE_NAME,
            PVC_SOURCE_NAME,
            CONTAINER_DISK_SOURCE_NAME,
            UPLOAD_SOURCE_NAME,
          ]}
          httpSourceHelperURL={httpSourceHelperURL}
          registrySourceHelperText={registrySourceHelperText}
          data-test-id="cd-boot-source"
          relevantUpload={cdUpload}
        />
      )}

      {cdSource && <Divider className="divider" />}
      <SelectSource
        initialVolumeQuantity={getTemplateStorageQuantity(template) || '30Gi'}
        onSourceChange={setDiskSource}
        selectedSource={diskSource}
        withSize
        sourceOptions={[
          DEFAULT_SOURCE,
          PVC_SOURCE_NAME,
          REGISTRY_SOURCE_NAME,
          HTTP_SOURCE_NAME,
          UPLOAD_SOURCE_NAME,
          BLANK_SOURCE_NAME,
        ]}
        sourceLabel={t('Disk source')}
        sourcePopOver={<SelectDiskSourcePopOver />}
        httpSourceHelperURL={httpSourceHelperURL}
        registrySourceHelperText={registrySourceHelperText}
        relevantUpload={diskUpload}
        data-test-id="disk-boot-source"
        defaultsAsBlank={!!cdSource}
      />
      <Divider className="divider" />
      <FormGroup label={t('Drivers')} fieldId="customize-cdrom-drivers">
        <Checkbox
          isChecked={withDrivers}
          onChange={setDrivers}
          label={t('Mount Windows drivers disk')}
          id="cdrom-drivers"
          data-test-id="cdrom-drivers"
        />
      </FormGroup>
    </div>
  );
};
