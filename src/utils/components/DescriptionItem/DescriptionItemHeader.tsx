import React, { FC, ReactNode } from 'react';

import DescriptionItemPopoverContent from '@kubevirt-utils/components/DescriptionItem/DescriptionItemPopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
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
  olsObj?: K8sResourceCommon;
  promptType?: OLSPromptType;
};

export const DescriptionItemHeader: FC<DescriptionItemHeaderProps> = ({
  bodyContent,
  breadcrumb,
  descriptionHeader,
  isPopover,
  label,
  maxWidth,
  moreInfoURL,
  olsObj,
  promptType,
}) => {
  if (isPopover && bodyContent) {
    return (
      <Popover
        bodyContent={(hide) => (
          <DescriptionItemPopoverContent
            bodyContent={bodyContent}
            breadcrumb={breadcrumb}
            hide={hide}
            moreInfoURL={moreInfoURL}
            olsObj={olsObj}
            promptType={promptType}
          />
        )}
        hasAutoWidth
        headerContent={descriptionHeader}
        maxWidth={maxWidth || '30rem'}
      >
        <DescriptionListTermHelpTextButton>{descriptionHeader}</DescriptionListTermHelpTextButton>
      </Popover>
    );
  }

  return (
    <DescriptionListTerm className="DescriptionItemHeader--list-term">
      {descriptionHeader}
      <span className="pf-v6-u-ml-xs">{label}</span>
    </DescriptionListTerm>
  );
};
