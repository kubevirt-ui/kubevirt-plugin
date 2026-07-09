import classNames from 'classnames';
import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import EditButton from '@kubevirt-utils/components/EditButton/EditButton';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ButtonVariant } from '@patternfly/react-core';

import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import './VMCreationLocationDisplay.scss';

type VMCreationLocationDisplayProps = {
  editCreationLocation: boolean;
  setEditCreationLocation: (value: boolean) => void;
};

const VMCreationLocationDisplay: FC<VMCreationLocationDisplayProps> = ({
  editCreationLocation,
  setEditCreationLocation,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();

  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);

  const { control } = useVMWizard();
  const [cluster, folder, project] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER,
      CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER,
      CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT,
    ],
  });

  return (
    <div
      className={classNames('vm-creation-location-display', 'name-and-description-form', {
        'vm-creation-location-display--editing': editCreationLocation,
      })}
    >
      <div className="vm-creation-location-display__form-control pf-v6-c-form-control">
        <span className="vm-creation-location-display__content">
          {isACMPage && (
            <span>
              <span className="pf-v6-u-font-weight-bold pf-v6-u-mr-xs">{t('Cluster')}</span>
              {cluster || NO_DATA_DASH}
              <span className="pf-v6-u-font-weight-bold pf-v6-u-mx-xs">{'>'}</span>
            </span>
          )}
          <span className="pf-v6-u-font-weight-bold pf-v6-u-mr-xs">{t('Project')}</span>
          {project || NO_DATA_DASH}
          {!treeViewFoldersLoading && treeViewFoldersEnabled && (
            <>
              <span className="pf-v6-u-font-weight-bold pf-v6-u-mx-xs">{'>'}</span>
              <span className="pf-v6-u-font-weight-bold pf-v6-u-mr-xs">{t('Folder')}</span>
              {folder || NO_DATA_DASH}
            </>
          )}
        </span>
      </div>
      <EditButton
        ariaLabel={t('Edit VM creation location')}
        className="pf-v6-u-ml-sm"
        onClick={() => setEditCreationLocation(true)}
        testId={'vm-creation-location-edit-btn'}
        variant={ButtonVariant.link}
      />
    </div>
  );
};

export default VMCreationLocationDisplay;
