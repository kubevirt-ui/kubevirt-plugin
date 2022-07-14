import React from 'react';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import './DataImportCronManageDetails.scss';

type DataImportCronManageDetailsProps = {
  dataImportCron: V1beta1DataImportCron;
  onEditClick: () => void;
};

export const DataImportCronManageDetails: React.FC<DataImportCronManageDetailsProps> = ({
  dataImportCron,
  onEditClick,
}) => {
  const { t } = useKubevirtTranslation();
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;

  const source = dataImportCron?.spec?.template.spec?.source?.registry?.url;
  const importsToKeep = dataImportCron?.spec?.importsToKeep || t('3 (default)');

  return (
    <DescriptionItem
      descriptionHeader={t('Automatic update and scheduling')}
      data-test-id="dataimportcron-manage-details"
      isEdit
      showEditOnTitle
      onEditClick={onEditClick}
      descriptionData={
        <DescriptionList className="kv-dataimportcron-managed-details">
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Automatic updates')}</DescriptionListTerm>
            <DescriptionListDescription>{t('On')}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Source')}</DescriptionListTerm>
            <DescriptionListDescription>{source ?? NotAvailable}</DescriptionListDescription>
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
<<<<<<< HEAD
                  <DescriptionListTerm>{t('Starts at')}</DescriptionListTerm>
                  <DescriptionListDescription>5:00 AM</DescriptionListDescription>
                  <DescriptionListTerm>{t('Repeats every')}</DescriptionListTerm>
                  <DescriptionListDescription>2 Weeks on Monday</DescriptionListDescription>
=======
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
>>>>>>> 044c2733 (add dic manage modal and logic)
                </DescriptionListGroup>
              </DescriptionList>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      }
    />
  );
};
