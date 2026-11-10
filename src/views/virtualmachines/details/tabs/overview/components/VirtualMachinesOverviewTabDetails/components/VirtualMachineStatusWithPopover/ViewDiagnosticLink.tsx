import type { FC } from 'react';
import { Link } from 'react-router';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMURL } from '@multicluster/urls';
import { Content } from '@patternfly/react-core';

type ViewDiagnosticLinkProps = {
  vm: V1VirtualMachine;
};

const ViewDiagnosticLink: FC<ViewDiagnosticLinkProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Content component="p">
      <Link to={`${getVMURL(getCluster(vm), getNamespace(vm), getName(vm))}/diagnostics`}>
        {t('View diagnostic')}
      </Link>
    </Content>
  );
};

export default ViewDiagnosticLink;
