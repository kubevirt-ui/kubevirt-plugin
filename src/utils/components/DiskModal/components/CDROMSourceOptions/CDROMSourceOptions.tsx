import React, { FC } from 'react';

import DiskSourceUploadPVC from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, Radio, Stack, StackItem } from '@patternfly/react-core';

type EmptyDriveOption = {
  description: string;
  isAllowed: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

type CDROMSourceOptionsProps = {
  emptyDriveOption?: EmptyDriveOption;
  existingISOSelected: boolean;
  isoOptions: EnhancedSelectOptionProps[];
  isUploading: boolean;
  onClearUpload?: () => void;
  onFileUpload: () => void;
  onISOSelect: (value: string) => void;
  radioNamePrefix: string;
  relevantUpload?: DataUpload;
  selectedISO: string;
  uploadEnabled: boolean;
};

const CDROMSourceOptions: FC<CDROMSourceOptionsProps> = ({
  emptyDriveOption,
  existingISOSelected,
  isoOptions,
  isUploading,
  onClearUpload,
  onFileUpload,
  onISOSelect,
  radioNamePrefix,
  relevantUpload,
  selectedISO,
  uploadEnabled,
}) => {
  const { t } = useKubevirtTranslation();
  const labelId = `${radioNamePrefix}-label`;

  return (
    <>
      <StackItem className="pf-v6-u-mt-md">
        <Content component={ContentVariants.p} id={labelId}>
          {t('Select mount option')}
        </Content>
      </StackItem>
      <StackItem>
        <Stack aria-labelledby={labelId} hasGutter role="radiogroup">
          <StackItem>
            <Radio
              id={`${radioNamePrefix}-existing`}
              isChecked={existingISOSelected}
              isDisabled={isUploading}
              label={t('Use existing ISO')}
              name={radioNamePrefix}
              onChange={() => onISOSelect('')}
            />
            {existingISOSelected && (
              <div className="pf-v6-u-ml-lg pf-v6-u-mt-sm">
                <InlineFilterSelect
                  toggleProps={{
                    isDisabled: isUploading,
                    isFullWidth: true,
                  }}
                  options={isoOptions}
                  placeholder={t('Select ISO file')}
                  selected={selectedISO}
                  setSelected={onISOSelect}
                />
              </div>
            )}
          </StackItem>
          <StackItem>
            <Radio
              id={`${radioNamePrefix}-upload`}
              isChecked={uploadEnabled}
              isDisabled={isUploading}
              label={t('Upload new ISO')}
              name={radioNamePrefix}
              onChange={onFileUpload}
            />
            {uploadEnabled && (
              <div className="pf-v6-u-ml-lg pf-v6-u-mt-sm">
                <DiskSourceUploadPVC
                  acceptedFileTypes={{
                    'application/*': ['.iso', '.img', '.qcow2', '.gz', '.xz'],
                  }}
                  handleClearUpload={onClearUpload}
                  handleUpload={onFileUpload}
                  label=""
                  relevantUpload={relevantUpload}
                />
              </div>
            )}
          </StackItem>
          {emptyDriveOption && (
            <StackItem>
              <Radio
                description={emptyDriveOption.description}
                id={`${radioNamePrefix}-empty`}
                isChecked={emptyDriveOption.isSelected}
                isDisabled={isUploading || !emptyDriveOption.isAllowed}
                label={t('Leave empty drive')}
                name={radioNamePrefix}
                onChange={emptyDriveOption.onSelect}
              />
            </StackItem>
          )}
        </Stack>
      </StackItem>
    </>
  );
};

export default CDROMSourceOptions;
