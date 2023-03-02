import * as React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type DescriptionProps = {
  title: string;
  content: string | JSX.Element;
  popoverContent?: string | JSX.Element;
};

const DescriptionItem: React.FC<DescriptionProps> = ({ title, content, popoverContent }) => (
  <DescriptionListGroup>
    {popoverContent ? (
      <DescriptionListTermHelpText>
        <Popover hasAutoWidth maxWidth="30rem" headerContent={title} bodyContent={popoverContent}>
          <DescriptionListTermHelpTextButton>{title}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
    ) : (
      <DescriptionListTerm>{title}</DescriptionListTerm>
    )}

    <DescriptionListDescription>{content}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default DescriptionItem;
