import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { useVirtioWinDriversInfo } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { Button, ButtonVariant, FlexItem, Spinner, Tooltip } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';

import { getVersionFromImage } from './utils';

import './VirtIODriversSection.scss';

const VirtIODriversSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [driversInfo, loading] = useVirtioWinDriversInfo();

  const { downloadURL, image } = driversInfo;
  const version = getVersionFromImage(image) ?? NO_DATA_DASH;

  const downloadButton = (
    <Button
      className="virtio-drivers-section__download-button"
      component="a"
      data-test="virtio-drivers-section-download-iso"
      href={downloadURL}
      icon={<DownloadIcon />}
      iconPosition="start"
      isAriaDisabled={!downloadURL}
      rel="noopener noreferrer"
      target="_blank"
      variant={ButtonVariant.secondary}
    >
      {t('Download ISO')}
    </Button>
  );

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        downloadURL ? (
          downloadButton
        ) : (
          <Tooltip content={t('No ISO available')}>{downloadButton}</Tooltip>
        )
      }
      id="virtio-drivers-section"
      toggleContent={t('Windows drivers')}
    >
      {loading ? (
        <Spinner size="md" />
      ) : (
        <FlexItem>
          <span className="pf-v6-u-font-weight-bold">{t('Version:')}</span> {version}
        </FlexItem>
      )}
    </ExpandSectionWithCustomToggle>
  );
};

export default VirtIODriversSection;
