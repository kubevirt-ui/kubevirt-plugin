import React from 'react';
import classnames from 'classnames';

import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { isDataImportCronAutoUpdated, isDataResourceOwnedBySSP } from '../../../utils';

import './DataImportCronManageDetails.scss';

type DataImportCronManageDetailsProps = {
  dataImportCron: V1beta1DataImportCron;
  dataSource: V1beta1DataSource;
  onEditClick: () => void;
};

export const DataImportCronManageDetails: React.FC<DataImportCronManageDetailsProps> = ({
  dataImportCron,
  dataSource,
  onEditClick,
}) => {
  const { t } = useKubevirtTranslation();

  const source = dataImportCron?.spec?.template.spec?.source?.registry?.url;
  const importsToKeep = dataImportCron?.spec?.importsToKeep?.toString() || t('3 (default)');
  const isAutoUpdated = isDataImportCronAutoUpdated(dataSource, dataImportCron);
  const isOwnedBySSP = isDataResourceOwnedBySSP(dataImportCron);

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        <DescriptionList
          className={classnames('pf-c-description-list', 'kv-dataimportcron-managed-details')}
        >
          <VirtualMachineDescriptionItem
            descriptionData={isAutoUpdated ? t('On') : t('Off')}
            descriptionHeader={t('Automatic updates')}
          />
          <VirtualMachineDescriptionItem
            descriptionData={source ?? <MutedTextSpan text={t('Not available')} />}
            descriptionHeader={t('Source')}
          />
          <VirtualMachineDescriptionItem
            descriptionData={importsToKeep}
            descriptionHeader={t('Retain revisions')}
          />
          <VirtualMachineDescriptionItem
            descriptionData={
              <DescriptionList className="pf-c-description-list" isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Cron expression')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ClipboardCopy
                      clickTip={t('Copied')}
                      data-test="cron-copy-command"
                      hoverTip={t('Copy to clipboard')}
                      isReadOnly
                    >
                      {dataImportCron?.spec?.schedule}
                    </ClipboardCopy>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            }
            descriptionHeader={t('Scheduling settings')}
          />
        </DescriptionList>
      }
      data-test-id="dataimportcron-manage-details"
      descriptionHeader={t('Automatic update and scheduling')}
      isEdit={!isOwnedBySSP}
      onEditClick={onEditClick}
      showEditOnTitle
    />
  );
};
