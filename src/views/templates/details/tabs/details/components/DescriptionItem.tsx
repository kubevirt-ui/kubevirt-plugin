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
  content: JSX.Element | string;
  popoverContent?: JSX.Element | string;
  title: string;
};

const DescriptionItem: React.FC<DescriptionProps> = ({ content, popoverContent, title }) => (
  <DescriptionListGroup>
    {popoverContent ? (
      <DescriptionListTermHelpText>
        <Popover bodyContent={popoverContent} hasAutoWidth headerContent={title} maxWidth="30rem">
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
