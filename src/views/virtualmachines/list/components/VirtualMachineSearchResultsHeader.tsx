import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMListURL from '@multicluster/hooks/useVMListURL';
import { Button, Flex, Title } from '@patternfly/react-core';
import { AngleLeftIcon } from '@patternfly/react-icons';

const VirtualMachineSearchResultsHeader: FC = () => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const vmlistURL = useVMListURL();

  return (
    <Flex className="pf-v6-u-mb-md" justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      <Title headingLevel="h2" size="md">
        {t('Search results')}
      </Title>
      <Button
        onClick={() => {
          navigate(vmlistURL);
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
