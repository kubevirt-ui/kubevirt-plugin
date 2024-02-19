import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListTerm,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

import './DescriptionItem.scss';

type DescriptionItemHeaderProps = {
  bodyContent: ReactNode;
  breadcrumb?: string;
  descriptionHeader: ReactNode;
  isPopover: boolean;
  label?: ReactNode;
  maxWidth?: string;
  moreInfoURL?: string;
};

export const DescriptionItemHeader: FC<DescriptionItemHeaderProps> = ({
  bodyContent,
  breadcrumb,
  descriptionHeader,
  isPopover,
  label,
  maxWidth,
  moreInfoURL,
}) => {
  const { t } = useKubevirtTranslation();

  if (isPopover && bodyContent) {
    return (
      <Popover
        bodyContent={
          <>
            {bodyContent}
            {moreInfoURL && (
              <>
                {t('More info: ')}
                <a href={moreInfoURL}>{moreInfoURL}</a>
              </>
            )}
            {breadcrumb && (
              <div className="margin-top">
                <Breadcrumb>
                  {breadcrumb.split('.').map((item) => (
                    <BreadcrumbItem key={item}>{item}</BreadcrumbItem>
                  ))}
                </Breadcrumb>
              </div>
            )}
          </>
        }
        hasAutoWidth
        headerContent={descriptionHeader}
        maxWidth={maxWidth || '30rem'}
      >
        <DescriptionListTermHelpTextButton className="pf-c-description-list__text">
          {descriptionHeader}
        </DescriptionListTermHelpTextButton>
      </Popover>
    );
  }

  return (
    <DescriptionListTerm className="DescriptionItemHeader--list-term">
      {descriptionHeader} {label}
    </DescriptionListTerm>
  );
};
