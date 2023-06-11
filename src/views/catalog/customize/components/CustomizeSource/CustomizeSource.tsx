import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
  cdSource: undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource;
  cdUpload?: DataUpload;
  diskSource: V1beta1DataVolumeSpec;
  diskUpload?: DataUpload;
  isBootSourceAvailable?: boolean;
  setCDSource: (cdSource: undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource) => void;
  setDiskSource: (customSource: undefined | V1beta1DataVolumeSpec) => void;
  setDrivers: (withDrivers: boolean) => void;
  template: V1Template;
  withDrivers: boolean;
};

export const CustomizeSource: React.FC<CustomizeSourceProps> = ({
  cdSource,
  cdUpload,
  diskSource,
  diskUpload,
  isBootSourceAvailable,
  setCDSource,
  setDiskSource,
  setDrivers,
  template,
  withDrivers,
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
      <BootCDCheckbox cdSource={cdSource} onChange={onCDCheckboxChange} />

      {cdSource && (
        <SelectSource
          sourceOptions={[
            HTTP_SOURCE_NAME,
            PVC_SOURCE_NAME,
            CONTAINER_DISK_SOURCE_NAME,
            UPLOAD_SOURCE_NAME,
          ]}
          data-test-id="cd-boot-source"
          httpSourceHelperURL={httpSourceHelperURL}
          onSourceChange={setCDSource}
          registrySourceHelperText={registrySourceHelperText}
          relevantUpload={cdUpload}
          selectedSource={cdSource}
          sourceLabel={t('CD source')}
          sourcePopOver={<SelectCDSourcePopOver />}
        />
      )}

      {cdSource && <Divider className="divider" />}
      <SelectSource
        sourceOptions={
          isBootSourceAvailable
            ? [
                DEFAULT_SOURCE,
                PVC_SOURCE_NAME,
                REGISTRY_SOURCE_NAME,
                HTTP_SOURCE_NAME,
                UPLOAD_SOURCE_NAME,
                BLANK_SOURCE_NAME,
              ]
            : [
                PVC_SOURCE_NAME,
                REGISTRY_SOURCE_NAME,
                HTTP_SOURCE_NAME,
                UPLOAD_SOURCE_NAME,
                BLANK_SOURCE_NAME,
              ]
        }
        data-test-id="disk-boot-source"
        defaultsAsBlank={Boolean(cdSource)}
        httpSourceHelperURL={httpSourceHelperURL}
        initialVolumeQuantity={getTemplateStorageQuantity(template) || '30Gi'}
        onSourceChange={setDiskSource}
        registrySourceHelperText={registrySourceHelperText}
        relevantUpload={diskUpload}
        selectedSource={diskSource}
        sourceLabel={t('Disk source')}
        sourcePopOver={<SelectDiskSourcePopOver />}
        withSize
      />
      <Divider className="divider" />
      <FormGroup fieldId="customize-cdrom-drivers" label={t('Drivers')}>
        <Checkbox
          data-test-id="cdrom-drivers"
          id="cdrom-drivers"
          isChecked={withDrivers}
          label={t('Mount Windows drivers disk')}
          onChange={setDrivers}
        />
      </FormGroup>
    </div>
  );
};
