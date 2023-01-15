import React from 'react';

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
  bodyContent: React.ReactNode;
  moreInfoURL?: string;
  breadcrumb?: string;
  descriptionHeader: string;
  maxWidth?: string;
};

export const DescriptionItemHeader: React.FC<DescriptionItemHeaderProps> = ({
  isPopover,
  bodyContent,
  moreInfoURL,
  breadcrumb,
  descriptionHeader,
  maxWidth,
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

  return <DescriptionListTerm>{descriptionHeader}</DescriptionListTerm>;
};
