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
    <DescriptionItem
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
            </DescriptionListDescription>
          </DescriptionListGroup>
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
