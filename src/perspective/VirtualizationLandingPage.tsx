import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye } from '@patternfly/react-core';

const VirtualizationLandingPage: FC = () => {
  const isAdmin = useIsAdmin();
  const [projects, projectsLoaded] = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectsLoaded) return;

    if (isAdmin) {
      navigate('/k8s/all-namespaces/virtualization-overview');
      return;
    }

    if (!isEmpty(projects)) {
      const preferredProject = projects.includes(DEFAULT_NAMESPACE)
        ? DEFAULT_NAMESPACE
        : projects[0];
      navigate(`/k8s/ns/${preferredProject}/virtualization-overview`);
      return;
    }

    navigate('/k8s/all-namespaces/virtualization-overview');
  }, [isAdmin, projects, projectsLoaded, navigate]);

  return (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
};

export default VirtualizationLandingPage;
