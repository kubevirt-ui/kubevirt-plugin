import React, { FC } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '@patternfly/react-core';

type OperatorPackageLinkProps = {
  operatorHubURL: string | undefined;
  packageName: string;
};

const OperatorPackageLink: FC<OperatorPackageLinkProps> = ({ operatorHubURL, packageName }) => {
  const navigate = useNavigate();

  if (!operatorHubURL) {
    return <>{packageName}</>;
  }

  return (
    <Button isInline onClick={() => navigate(operatorHubURL)} variant="link">
      {packageName}
    </Button>
  );
};

export default OperatorPackageLink;
