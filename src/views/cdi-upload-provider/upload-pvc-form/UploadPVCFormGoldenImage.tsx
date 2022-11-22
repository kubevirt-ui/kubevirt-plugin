import React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Checkbox, FormSelect, FormSelectOption } from '@patternfly/react-core';

import { getName, getNamespace } from '../utils/selectors';
import { OperatingSystemRecord } from '../utils/types';

import UploadPVCFormPVCNamespace from './UploadPVCFormPVCNamespace';

type UploadPVCFormGoldenImageProps = {
  operatingSystems: OperatingSystemRecord[];
  isLoading: boolean;
  handleOs: (newOs: string) => void;
  os: OperatingSystemRecord;
  pvcSizeFromTemplate: boolean;
  handlePvcSizeTemplate: (checked: boolean) => void;
  mountAsCDROM: boolean;
  handleCDROMChange: (checked: boolean) => void;
  namespace: string;
  osImageExists: boolean;
  goldenPvcs: V1alpha1PersistentVolumeClaim[];
};

const UploadPVCFormGoldenImage: React.FC<UploadPVCFormGoldenImageProps> = ({
  operatingSystems,
  isLoading,
  handleOs,
  os,
  pvcSizeFromTemplate,
  handlePvcSizeTemplate,
  mountAsCDROM,
  handleCDROMChange,
  namespace,
  osImageExists,
  goldenPvcs,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <label className="control-label co-required" htmlFor="golden-os">
        {t('Operating System')}
      </label>
      <div className="form-group">
        <FormSelect
          id="golden-os-select"
          isDisabled={isLoading}
          onChange={handleOs}
          value={os?.id || ''}
          isRequired
        >
          <FormSelectOption
            isDisabled={!!os}
            key="defaultValue"
            value=""
            label={t('--- Pick an Operating system ---')}
          />
          {operatingSystems.map(({ id, name, baseImageName, baseImageNamespace }) => {
            const goldenPVC = goldenPvcs?.find(
              (pvc) => getName(pvc) === baseImageName && getNamespace(pvc) === baseImageNamespace,
            );

            const labelGoldenPVC =
              goldenPVC &&
              t('{{nameOrId}} - Default data image already exists', {
                nameOrId: name || id,
              });

            const labelMissingBaseImageName =
              !baseImageName &&
              t('{{nameOrId}} - Template missing data image definition', {
                nameOrId: name || id,
              });

            const label = labelGoldenPVC || labelMissingBaseImageName || name || id;

            return <FormSelectOption key={id} value={id} label={label} />;
          })}
        </FormSelect>
        {os && (
          <>
            <Checkbox
              id="golden-os-checkbox-pvc-size-template"
              className="kv--create-upload__golden-switch"
              isChecked={pvcSizeFromTemplate}
              data-checked-state={pvcSizeFromTemplate}
              label={t('Use template size PVC')}
              onChange={handlePvcSizeTemplate}
            />
            <Checkbox
              id="golden-os-checkbox-cdrom-boot-source-template"
              className="kv--create-upload__golden-switch"
              isChecked={!!mountAsCDROM}
              data-checked-state={!!mountAsCDROM}
              label={t('This is a CD-ROM boot source')}
              onChange={handleCDROMChange}
            />
          </>
        )}
      </div>
      {osImageExists && (
        <div className="form-group">
          <Alert isInline variant="danger" title={t('Operating system source already defined')}>
            {t(
              'In order to add a new source for {{osName}} you will need to delete the following PVC:',
              { osName: os?.name },
            )}{' '}
            <ResourceLink
              hideIcon
              inline
              kind={PersistentVolumeClaimModel.kind}
              name={os?.baseImageName}
              namespace={os?.baseImageNamespace}
            />
          </Alert>
        </div>
      )}
      <UploadPVCFormPVCNamespace namespace={namespace} />
    </>
  );
};

export default UploadPVCFormGoldenImage;
