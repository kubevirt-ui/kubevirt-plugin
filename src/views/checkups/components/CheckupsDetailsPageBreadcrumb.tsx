import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
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
  const [namespace] = useActiveNamespace();

  if (!namespace) {
    return null;
  }

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
