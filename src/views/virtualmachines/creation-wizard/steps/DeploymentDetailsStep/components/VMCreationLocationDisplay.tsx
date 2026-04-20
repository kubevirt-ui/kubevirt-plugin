import React, { FCC } from 'react';

import EditButton from '@kubevirt-utils/components/EditButton/EditButton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ButtonVariant } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

type VMCreationLocationDisplayProps = {
  setEditCreationLocation: (value: boolean) => void;
};

const VMCreationLocationDisplay: FCC<VMCreationLocationDisplayProps> = ({
  setEditCreationLocation,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const { cluster, folder, project } = useVMWizardStore();

  return (
    <>
      {isACMPage && (
        <span>
          <span className="pf-v6-u-font-weight-bold pf-v6-u-mr-xs">{t('Cluster')}</span>
          {cluster || NO_DATA_DASH}
          <span className="pf-v6-u-font-weight-bold pf-v6-u-mx-xs">{'>'}</span>
        </span>
      )}
      <span className="pf-v6-u-font-weight-bold pf-v6-u-mr-xs">{t('Project')}</span>
      {project || NO_DATA_DASH}
      <span className="pf-v6-u-font-weight-bold pf-v6-u-mx-xs">{'>'}</span>
      <span className="pf-v6-u-font-weight-bold pf-v6-u-mr-xs">{t('Folder')}</span>
      {folder || NO_DATA_DASH}
      <EditButton
        ariaLabel={t('Edit VM creation location')}
        className="pf-v6-u-ml-sm"
        isInline
        onClick={() => setEditCreationLocation(true)}
        testId={'vm-creation-location-edit-btn'}
        variant={ButtonVariant.link}
      />
    </>
  );
};

export default VMCreationLocationDisplay;
