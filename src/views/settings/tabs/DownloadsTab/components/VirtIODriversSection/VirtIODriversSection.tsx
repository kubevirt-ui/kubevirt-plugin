import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { useVirtioWinDriversInfo } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { Button, ButtonVariant, FlexItem, Spinner, Tooltip } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { DOWNLOADS_TAB_IDS } from '@settings/search/constants';
import { getVersionFromImage } from './utils';

import './VirtIODriversSection.scss';

const VirtIODriversSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [driversInfo, loading] = useVirtioWinDriversInfo();

  const { image, downloadURL } = driversInfo;
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
      id="virtio-drivers-section"
      searchItemId={DOWNLOADS_TAB_IDS.virtioDriversWindows}
      toggleContent={t('VirtIO drivers for Windows')}
      customContent={
        downloadURL ? (
          downloadButton
        ) : (
          <Tooltip content={t('No ISO available')}>{downloadButton}</Tooltip>
        )
      }
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
