import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Breadcrumb, BreadcrumbItem, Button, ButtonVariant } from '@patternfly/react-core';

import { CheckupType } from '../utils/types';

type CheckupsDetailsPageBreadcrumbProps = {
  checkupType: CheckupType;
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
  const cluster = useClusterParam();

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Button
          onClick={() =>
            navigate(
              cluster
                ? `/k8s/cluster/${cluster}/ns/${namespace}/checkups/${checkupType}`
                : `/k8s/ns/${namespace}/checkups/${checkupType}`,
            )
          }
          isInline
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
