import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye } from '@patternfly/react-core';

const VirtualizationLandingPage: FC = () => {
  const isAdmin = useIsAdmin();
  const [namespaces, namespacesLoaded] = useNamespaces();
  const navigate = useNavigate();

  useEffect(() => {
    if (!namespacesLoaded) return;

    if (isAdmin) {
      navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}`);
      return;
    }

    if (!isEmpty(namespaces)) {
      const preferredNamespace = namespaces.includes(DEFAULT_NAMESPACE)
        ? DEFAULT_NAMESPACE
        : namespaces[0];
      navigate(`/k8s/ns/${preferredNamespace}/${VirtualMachineModelRef}`);
      return;
    }

    navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}`);
  }, [isAdmin, namespaces, namespacesLoaded, navigate]);

  return (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
};

export default VirtualizationLandingPage;
