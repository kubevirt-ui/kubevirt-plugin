import React from 'react';

import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
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
  dataSource: V1beta1DataSource;
  dataImportCron: V1beta1DataImportCron;
  onEditClick: () => void;
};

export const DataImportCronManageDetails: React.FC<DataImportCronManageDetailsProps> = ({
  dataSource,
  dataImportCron,
  onEditClick,
}) => {
  const { t } = useKubevirtTranslation();

  const source = dataImportCron?.spec?.template.spec?.source?.registry?.url;
  const importsToKeep = dataImportCron?.spec?.importsToKeep?.toString() || t('3 (default)');
  const isAutoUpdated = isDataImportCronAutoUpdated(dataSource, dataImportCron);
  const isOwnedBySSP = isDataResourceOwnedBySSP(dataImportCron);

  return (
    <DescriptionItem
      descriptionHeader={t('Automatic update and scheduling')}
      data-test-id="dataimportcron-manage-details"
      isEdit={!isOwnedBySSP}
      showEditOnTitle
      onEditClick={onEditClick}
      descriptionData={
        <DescriptionList className="kv-dataimportcron-managed-details">
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Automatic updates')}</DescriptionListTerm>
            <DescriptionListDescription>
              {isAutoUpdated ? t('On') : t('Off')}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Source')}</DescriptionListTerm>
            <DescriptionListDescription>
              {source ?? <MutedTextSpan text={t('Not available')} />}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Retain revisions')}</DescriptionListTerm>
            <DescriptionListDescription>{importsToKeep}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Scheduling settings')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Cron expression')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ClipboardCopy
                      isReadOnly
                      data-test="cron-copy-command"
                      clickTip={t('Copied')}
                      hoverTip={t('Copy to clipboard')}
                    >
                      {dataImportCron?.spec?.schedule}
                    </ClipboardCopy>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      }
    />
  );
};
