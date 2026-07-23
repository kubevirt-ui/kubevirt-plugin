import React, { FC } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '@patternfly/react-core';

type OperatorPackageLinkProps = {
  displayName: string;
  operatorHubURL: string | undefined;
};

const OperatorPackageLink: FC<OperatorPackageLinkProps> = ({ displayName, operatorHubURL }) => {
  const navigate = useNavigate();

  if (!operatorHubURL) {
    return <>{displayName}</>;
  }

  return (
    <Button isInline onClick={() => navigate(operatorHubURL)} variant="link">
      {displayName}
    </Button>
  );
};

export default OperatorPackageLink;
