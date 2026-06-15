import React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import BootableVolumeViewLink from '@kubevirt-utils/components/AddBootableVolumeModal/components/BootableVolumeViewLink';
import {
  DROPDOWN_FORM_SELECTION,
  isBackgroundImportSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { BootableVolumeToastHandlers } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  extractCreatedDataSources,
  getCreatedBootableVolumeUrl,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const showBootableVolumeImportStartedToast = (
  created: V1beta1DataSource[],
  { addInfoToast, navigate, t }: BootableVolumeToastHandlers,
): void => {
  const createdVolume = created[0];
  if (!createdVolume) {
    return;
  }

  addInfoToast({
    content: (
      <BootableVolumeViewLink
        name={getName(createdVolume)}
        onNavigate={navigate}
        url={getCreatedBootableVolumeUrl(createdVolume)}
      />
    ),
    timeout: false,
    title: t('Bootable volume import started'),
  });
};

export const showBootableVolumeCreatedSuccessToast = (
  createdVolume: V1beta1DataSource,
  { addSuccessToast, navigate, t }: BootableVolumeToastHandlers,
): void => {
  addSuccessToast({
    content: (
      <BootableVolumeViewLink
        name={getName(createdVolume)}
        onNavigate={navigate}
        url={getCreatedBootableVolumeUrl(createdVolume)}
      />
    ),
    title: t('Bootable volume was created successfully'),
  });
};

export const handleAddBootableVolumeSuccess = (
  result: unknown,
  sourceType: DROPDOWN_FORM_SELECTION,
  toastHandlers: BootableVolumeToastHandlers,
): void => {
  const created = extractCreatedDataSources(result);
  if (isEmpty(created)) {
    return;
  }

  if (isBackgroundImportSource(sourceType)) {
    showBootableVolumeImportStartedToast(created, toastHandlers);
    return;
  }

  showBootableVolumeCreatedSuccessToast(created[0], toastHandlers);
};
