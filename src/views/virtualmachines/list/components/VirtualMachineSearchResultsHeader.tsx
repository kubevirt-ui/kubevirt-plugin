import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Flex, Title } from '@patternfly/react-core';
import { AngleLeftIcon } from '@patternfly/react-icons/dist/esm/icons/angle-left-icon';

const VirtualMachineSearchResultsHeader: FC = () => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();

  return (
    <Flex className="pf-v6-u-mb-md" justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      <Title headingLevel="h2" size="md">
        {t('Search results')}
      </Title>
      <Button
        onClick={() => {
          navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}`);
        }}
        icon={<AngleLeftIcon />}
        variant="link"
      >
        {t('Back to VirtualMachines list')}
      </Button>
    </Flex>
  );
};

export default VirtualMachineSearchResultsHeader;
