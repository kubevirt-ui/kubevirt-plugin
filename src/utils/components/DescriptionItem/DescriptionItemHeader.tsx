import React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListTerm,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type DescriptionItemHeaderProps = {
  isPopover: boolean;
  bodyContent: React.ReactNode;
  moreInfoURL?: string;
  breadcrumb?: string;
  descriptionHeader: string;
};

export const DescriptionItemHeader: React.FC<DescriptionItemHeaderProps> = ({
  isPopover,
  bodyContent,
  moreInfoURL,
  breadcrumb,
  descriptionHeader,
}) => {
  const { t } = useKubevirtTranslation();

  if (isPopover && bodyContent) {
    return (
      <Popover
        headerContent={descriptionHeader}
        bodyContent={
          <>
            {bodyContent}
            {moreInfoURL && (
              <>
                {t('More info: ')}
                <Link to={moreInfoURL}>{moreInfoURL}</Link>
              </>
            )}
            {breadcrumb && (
              <Breadcrumb>
                {breadcrumb.split('.').map((item) => (
                  <BreadcrumbItem key={item}>{item}</BreadcrumbItem>
                ))}
              </Breadcrumb>
            )}
          </>
        }
      >
        <DescriptionListTermHelpTextButton> {descriptionHeader} </DescriptionListTermHelpTextButton>
      </Popover>
    );
  }

  return <DescriptionListTerm>{descriptionHeader}</DescriptionListTerm>;
};
