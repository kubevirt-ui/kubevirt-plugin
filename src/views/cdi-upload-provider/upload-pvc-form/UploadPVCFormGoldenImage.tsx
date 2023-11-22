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
  goldenPvcs: V1alpha1PersistentVolumeClaim[];
  handleCDROMChange: (checked: boolean) => void;
  handleOs: (newOs: string) => void;
  handlePvcSizeTemplate: (checked: boolean) => void;
  isLoading: boolean;
  mountAsCDROM: boolean;
  namespace: string;
  operatingSystems: OperatingSystemRecord[];
  os: OperatingSystemRecord;
  osImageExists: boolean;
  pvcSizeFromTemplate: boolean;
};

const UploadPVCFormGoldenImage: React.FC<UploadPVCFormGoldenImageProps> = ({
  goldenPvcs,
  handleCDROMChange,
  handleOs,
  handlePvcSizeTemplate,
  isLoading,
  mountAsCDROM,
  namespace,
  operatingSystems,
  os,
  osImageExists,
  pvcSizeFromTemplate,
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
          isRequired
          onChange={handleOs}
          value={os?.id || ''}
        >
          <FormSelectOption
            isDisabled={!!os}
            key="defaultValue"
            label={t('--- Pick an Operating system ---')}
            value=""
          />
          {operatingSystems.map(({ baseImageName, baseImageNamespace, id, name }) => {
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

            return <FormSelectOption key={id} label={label} value={id} />;
          })}
        </FormSelect>
        {os && (
          <>
            <Checkbox
              className="kv--create-upload__golden-switch"
              data-checked-state={pvcSizeFromTemplate}
              id="golden-os-checkbox-pvc-size-template"
              isChecked={pvcSizeFromTemplate}
              label={t('Use template size PVC')}
              onChange={handlePvcSizeTemplate}
            />
            <Checkbox
              className="kv--create-upload__golden-switch"
              data-checked-state={!!mountAsCDROM}
              id="golden-os-checkbox-cdrom-boot-source-template"
              isChecked={!!mountAsCDROM}
              label={t('This is a CD-ROM boot source')}
              onChange={handleCDROMChange}
            />
          </>
        )}
      </div>
      {osImageExists && (
        <div className="form-group">
          <Alert isInline title={t('Operating system source already defined')} variant="danger">
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
