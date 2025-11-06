import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { Breadcrumb, BreadcrumbItem, Button, ButtonVariant } from '@patternfly/react-core';

import { CHECKUP_URLS } from '../utils/constants';

type CheckupsDetailsPageBreadcrumbProps = {
  checkupType: typeof CHECKUP_URLS[keyof typeof CHECKUP_URLS];
  detailsLabel: string;
  parentLabel: string;
};

const CheckupsDetailsPageBreadcrumb: FC<CheckupsDetailsPageBreadcrumbProps> = ({
  checkupType,
  detailsLabel,
  parentLabel,
}) => {
  const navigate = useNavigate();
  const namespace = useActiveNamespace();

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Button
          isInline
          onClick={() => navigate(`/k8s/ns/${namespace}/checkups/${checkupType}`)}
          variant={ButtonVariant.link}
        >
          {parentLabel}
        </Button>
      </BreadcrumbItem>
      <BreadcrumbItem>{detailsLabel}</BreadcrumbItem>
    </Breadcrumb>
  );
};

export default CheckupsDetailsPageBreadcrumb;
