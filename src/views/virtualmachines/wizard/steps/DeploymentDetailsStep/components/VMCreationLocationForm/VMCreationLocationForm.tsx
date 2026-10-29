import { type FC, useCallback, useState } from 'react';

import useIsACMPage from '@multicluster/useIsACMPage';
import { Form } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import ClusterField from './components/ClusterField';
import DefaultNamespaceAccessReview from './components/DefaultNamespaceAccessReview';
import GroupField from './components/GroupField';
import ProjectField from './components/ProjectField';

import './VMCreationLocationForm.scss';

const VMCreationLocationForm: FC = () => {
  const isACMPage = useIsACMPage();
  const { setValue } = useVMWizardForm();
  const [pendingDefaultAccessCluster, setPendingDefaultAccessCluster] = useState<string | null>(
    null,
  );

  const onAccessReviewSettled = useCallback(
    (canCreate: boolean): void => {
      if (!canCreate) {
        setValue('deployment.project', '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }

      setPendingDefaultAccessCluster(null);
    },
    [setValue],
  );

  return (
    <Form className="vm-creation-location-form">
      {isACMPage && (
        <ClusterField setPendingDefaultAccessCluster={setPendingDefaultAccessCluster} />
      )}
      <ProjectField isValidatingDefaultAccess={pendingDefaultAccessCluster !== null} />
      {pendingDefaultAccessCluster !== null && (
        <DefaultNamespaceAccessReview
          cluster={pendingDefaultAccessCluster}
          key={pendingDefaultAccessCluster}
          onSettled={onAccessReviewSettled}
        />
      )}
      <GroupField />
    </Form>
  );
};

export default VMCreationLocationForm;
