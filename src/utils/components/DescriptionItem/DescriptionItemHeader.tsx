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
  isPopover: boolean;
  bodyContent: ReactNode;
  moreInfoURL?: string;
  breadcrumb?: string;
  descriptionHeader: string;
  maxWidth?: string;
  label?: ReactNode;
};

export const DescriptionItemHeader: FC<DescriptionItemHeaderProps> = ({
  isPopover,
  bodyContent,
  moreInfoURL,
  breadcrumb,
  descriptionHeader,
  maxWidth,
  label,
}) => {
  const { t } = useKubevirtTranslation();

  if (isPopover && bodyContent) {
    return (
      <Popover
        hasAutoWidth
        maxWidth={maxWidth || '30rem'}
        headerContent={descriptionHeader}
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
      >
        <DescriptionListTermHelpTextButton> {descriptionHeader} </DescriptionListTermHelpTextButton>
      </Popover>
    );
  }

  return (
    <DescriptionListTerm>
      {descriptionHeader} {label}
    </DescriptionListTerm>
  );
};
